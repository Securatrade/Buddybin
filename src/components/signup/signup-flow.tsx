"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { trackSignupEvent } from "@/components/analytics";
import { PriceSummary } from "@/components/signup/price-summary";
import { Button } from "@/components/ui/button";
import {
  BIN_LOCATIONS,
  BIN_TYPES,
  COLLECTION_DAYS,
  type BinType,
  type CollectionDay,
} from "@/lib/constants";
import {
  DEFAULT_PRICING_RULES,
  calculatePlanTotal,
  collectionSummary,
} from "@/lib/pricing";
import {
  addressSchema,
  customerDetailsSchema,
  signupSchema,
  type AddressInput,
  type CustomerDetailsInput,
  type PlanBinInput,
} from "@/lib/schemas";
import { cn, formatPence } from "@/lib/utils";

const steps = ["Address", "Bins", "Details", "Payment"] as const;

const fieldClass =
  "mt-2 w-full rounded-lg border border-buddy-border bg-white px-4 py-3 text-base text-buddy-navy shadow-sm focus:border-buddy-blue focus:outline-none focus:ring-4 focus:ring-buddy-blue/15";

const blankAddress: AddressInput = {
  postcode: "",
  addressLine1: "",
  addressLine2: "",
  town: "",
  county: "",
};

const blankCustomer: CustomerDetailsInput = {
  fullName: "",
  email: "",
  mobile: "",
  binLocation: "Front of property",
  binLocationOther: "",
  accessInstructions: "",
  termsAccepted: false,
};

const MONTHLY_CLEANING_FREQUENCY_WEEKS = 4 as const;

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GooglePlaceResult = {
  address_components?: GoogleAddressComponent[];
  formatted_address?: string;
};

type GoogleMapsAutocomplete = {
  addListener: (
    eventName: "place_changed",
    handler: () => void,
  ) => { remove: () => void };
  getPlace: () => GooglePlaceResult;
};

type GoogleMapsApi = {
  maps: {
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        options: {
          componentRestrictions?: { country: string | string[] };
          fields?: string[];
          types?: string[];
        },
      ) => GoogleMapsAutocomplete;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    __buddyGooglePlacesReady?: () => void;
  }
}

let googlePlacesPromise: Promise<GoogleMapsApi> | null = null;

function loadGooglePlaces(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Places can only load in the browser"));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  if (googlePlacesPromise) {
    return googlePlacesPromise;
  }

  googlePlacesPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    window.__buddyGooglePlacesReady = () => {
      if (window.google?.maps?.places) {
        resolve(window.google);
      } else {
        reject(new Error("Google Places did not load"));
      }
    };

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.buddyGooglePlaces = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places&callback=__buddyGooglePlacesReady`;
    script.onerror = () => reject(new Error("Google Places script failed"));
    document.head.appendChild(script);
  });

  return googlePlacesPromise;
}

function addressComponent(
  components: GoogleAddressComponent[],
  type: string,
  key: "long_name" | "short_name" = "long_name",
) {
  return components.find((component) => component.types.includes(type))?.[key] || "";
}

function addressFromGooglePlace(place: GooglePlaceResult): Partial<AddressInput> {
  const components = place.address_components || [];
  const streetNumber = addressComponent(components, "street_number");
  const route = addressComponent(components, "route");
  const premise = addressComponent(components, "premise");
  const subpremise = addressComponent(components, "subpremise");
  const street = [streetNumber, route].filter(Boolean).join(" ");
  const formattedFirstLine = place.formatted_address?.split(",")[0]?.trim() || "";

  return {
    addressLine1:
      [subpremise, premise, street].filter(Boolean).join(", ") ||
      formattedFirstLine,
    town:
      addressComponent(components, "postal_town") ||
      addressComponent(components, "locality") ||
      addressComponent(components, "administrative_area_level_3"),
    county:
      addressComponent(components, "administrative_area_level_2") ||
      addressComponent(components, "administrative_area_level_1"),
    postcode: addressComponent(components, "postal_code", "short_name"),
  };
}

function newClientId() {
  return globalThis.crypto?.randomUUID?.() || `bin-${Date.now()}-${Math.random()}`;
}

function createSelectedBin(binType: BinType, collectionDay: CollectionDay): PlanBinInput {
  return {
    clientId: newClientId(),
    binType,
    cleaningFrequencyWeeks: MONTHLY_CLEANING_FREQUENCY_WEEKS,
    collectionDay,
    collectionFrequency: "weekly",
    nextCollectionDate: "",
  };
}

export function SignupFlow() {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<AddressInput>(blankAddress);
  const [addressError, setAddressError] = useState<string>("");
  const [bins, setBins] = useState<PlanBinInput[]>([]);
  const [collectionDay, setCollectionDay] = useState<CollectionDay>("Tuesday");
  const [differentCollectionDays, setDifferentCollectionDays] = useState(false);
  const [collectionDayNotes, setCollectionDayNotes] = useState("");
  const [binError, setBinError] = useState<string>("");
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [pricingRules, setPricingRules] = useState(DEFAULT_PRICING_RULES);
  const [showMobilePrice, setShowMobilePrice] = useState(false);
  const signupRef = useRef<HTMLElement | null>(null);
  const addressLine1Ref = useRef<HTMLInputElement | null>(null);

  const customerForm = useForm<CustomerDetailsInput>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: blankCustomer,
    mode: "onBlur",
  });
  const selectedBinLocation = useWatch({
    control: customerForm.control,
    name: "binLocation",
  });

  useEffect(() => {
    trackSignupEvent("signup_started");
    fetch("/api/pricing")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.rules?.length) {
          setPricingRules(payload.rules);
        }
      })
      .catch(() => {
        setPricingRules(DEFAULT_PRICING_RULES);
      });
  }, []);

  useEffect(() => {
    const node = signupRef.current;
    if (window.location.hash === "#signup") {
      window.requestAnimationFrame(() => setShowMobilePrice(true));
    }

    if (!node || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setShowMobilePrice(Boolean(entry?.isIntersecting)),
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const input = addressLine1Ref.current;
    if (step !== 0 || !apiKey || !input) {
      return;
    }

    let cancelled = false;
    let listener: { remove: () => void } | null = null;

    loadGooglePlaces(apiKey)
      .then((google) => {
        if (cancelled || !addressLine1Ref.current) {
          return;
        }

        const autocomplete = new google.maps.places.Autocomplete(
          addressLine1Ref.current,
          {
            componentRestrictions: { country: "gb" },
            fields: ["address_components", "formatted_address"],
            types: ["address"],
          },
        );

        listener = autocomplete.addListener("place_changed", () => {
          const googleAddress = addressFromGooglePlace(autocomplete.getPlace());
          setAddress((current) => ({
            ...current,
            ...Object.fromEntries(
              Object.entries(googleAddress).filter(([, value]) => value),
            ),
          }));
          setAddressError("");
        });
      })
      .catch(() => {
        googlePlacesPromise = null;
      });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [step]);

  const calculation = useMemo(
    () => calculatePlanTotal(bins, pricingRules),
    [bins, pricingRules],
  );
  const selectedBinTypes = useMemo(
    () => new Set(bins.map((bin) => bin.binType)),
    [bins],
  );

  function updateAddress<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setAddress((current) => ({ ...current, [key]: value }));
  }

  function continueFromAddress() {
    const parsed = addressSchema.safeParse(address);
    if (!parsed.success) {
      setAddressError("Enter your address and postcode to continue.");
      return;
    }

    setAddress(parsed.data);
    setAddressError("");
    setStep(1);
    trackSignupEvent("postcode_completed");
  }

  function toggleBin(binType: BinType) {
    if (selectedBinTypes.has(binType)) {
      setBins((current) => current.filter((bin) => bin.binType !== binType));
      return;
    }

    setBins((current) => [...current, createSelectedBin(binType, collectionDay)]);
    setBinError("");
    trackSignupEvent("bin_added");
  }

  function updateCollectionDay(nextDay: CollectionDay) {
    setCollectionDay(nextDay);
    setBins((current) =>
      current.map((bin) => ({
        ...bin,
        collectionDay: nextDay,
      })),
    );
  }

  function continueFromBins() {
    if (bins.length === 0) {
      setBinError("Choose at least one bin to continue.");
      return;
    }

    setBinError("");
    setStep(2);
  }

  const continueFromCustomer = customerForm.handleSubmit((values) => {
    customerForm.reset(values);
    setStep(3);
    trackSignupEvent("customer_details_completed");
  });

  async function startCheckout() {
    setCheckoutError("");
    setSubmitting(true);

    const parsed = signupSchema.safeParse({
      address,
      bins,
      customer: customerForm.getValues(),
      collectionDayNotes: differentCollectionDays ? collectionDayNotes : "",
    });

    if (!parsed.success) {
      setSubmitting(false);
      setCheckoutError("Please check the signup details before payment.");
      return;
    }

    try {
      trackSignupEvent("checkout_started");
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = await response.json();

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Checkout failed");
      }

      window.location.assign(payload.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Stripe Checkout is temporarily unavailable.",
      );
      setSubmitting(false);
    }
  }

  return (
    <section
      id="signup"
      ref={signupRef}
      className={cn(
        "bg-white pt-4 sm:pt-6",
        calculation.bins.length > 0 ? "pb-28 sm:pb-12" : "pb-8 sm:pb-10",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="rounded-lg border border-buddy-border bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <ProgressIndicator step={step} />

            <div className="mt-6">
              {step === 0 ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-black text-buddy-navy">
                      Enter your address
                    </h2>
                  </div>
                  <div>
                    <label className="font-bold text-buddy-navy" htmlFor="addressLine1">
                      Address
                    </label>
                    <input
                      id="addressLine1"
                      ref={addressLine1Ref}
                      className={fieldClass}
                      value={address.addressLine1}
                      onChange={(event) =>
                        updateAddress("addressLine1", event.target.value)
                      }
                      autoComplete="address-line1"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-buddy-navy" htmlFor="postcode">
                      Postcode
                    </label>
                    <input
                      id="postcode"
                      className={fieldClass}
                      value={address.postcode}
                      onChange={(event) => updateAddress("postcode", event.target.value)}
                      autoComplete="postal-code"
                    />
                  </div>
                  {addressError ? (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {addressError}
                    </p>
                  ) : null}
                  <Button type="button" size="lg" className="w-full" onClick={continueFromAddress}>
                    Continue
                  </Button>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-buddy-navy">
                      Choose your bins
                    </h2>
                    <p className="mt-2 text-slate-600">
                      Choose the bins you&rsquo;d like cleaned each month.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {BIN_TYPES.map((bin) => {
                      const selected = selectedBinTypes.has(bin.value);
                      return (
                        <button
                          type="button"
                          key={bin.value}
                          onClick={() => toggleBin(bin.value)}
                          className={cn(
                            "flex min-h-24 items-center gap-3 rounded-lg border p-4 text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-buddy-blue/15",
                            selected
                              ? "border-buddy-green bg-buddy-pale"
                              : "border-buddy-border bg-white hover:border-buddy-blue",
                          )}
                          aria-pressed={selected}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                              selected
                                ? "border-buddy-green bg-buddy-green text-white"
                                : "border-buddy-border bg-white",
                            )}
                            aria-hidden
                          >
                            {selected ? <Check size={16} /> : null}
                          </span>
                          <span>
                            <span
                              className="mb-2 block h-3 w-9 rounded-full"
                              style={{ backgroundColor: bin.colour }}
                              aria-hidden
                            />
                            <span className="font-bold text-buddy-navy">{bin.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="font-bold text-buddy-navy" htmlFor="collectionDay">
                      When is your bin collection day?
                    </label>
                    <select
                      id="collectionDay"
                      className={fieldClass}
                      value={collectionDay}
                      onChange={(event) =>
                        updateCollectionDay(event.target.value as CollectionDay)
                      }
                    >
                      {COLLECTION_DAYS.map((day) => (
                        <option key={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-3 rounded-lg border border-buddy-border bg-white p-4 text-sm font-bold text-buddy-navy">
                    <input
                      type="checkbox"
                      checked={differentCollectionDays}
                      onChange={(event) =>
                        setDifferentCollectionDays(event.target.checked)
                      }
                      className="h-5 w-5 rounded border-buddy-border text-buddy-green focus:ring-buddy-green"
                    />
                    <span>My bins are emptied on different days</span>
                  </label>

                  {differentCollectionDays ? (
                    <div>
                      <label
                        className="font-bold text-buddy-navy"
                        htmlFor="collectionDayNotes"
                      >
                        Tell us which bins are emptied on which days (optional)
                      </label>
                      <textarea
                        id="collectionDayNotes"
                        rows={3}
                        className={fieldClass}
                        placeholder={"General Waste - Monday\nRecycling - Thursday"}
                        value={collectionDayNotes}
                        onChange={(event) => setCollectionDayNotes(event.target.value)}
                      />
                    </div>
                  ) : null}

                  {bins.length > 0 ? (
                    <div className="flex items-center justify-between rounded-lg border border-buddy-border bg-buddy-pale px-4 py-3">
                      <span className="font-bold text-buddy-navy">Monthly total</span>
                      <span className="text-xl font-black text-buddy-navy">
                        {formatPence(calculation.monthlyTotalPence)}
                      </span>
                    </div>
                  ) : null}

                  {binError ? (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {binError}
                    </p>
                  ) : null}

                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    disabled={bins.length === 0}
                    onClick={continueFromBins}
                  >
                    Continue
                  </Button>
                </div>
              ) : null}

              {step === 2 ? (
                <form className="space-y-4" onSubmit={continueFromCustomer}>
                  <h2 className="text-2xl font-black text-buddy-navy">
                    Your details
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="font-bold text-buddy-navy" htmlFor="fullName">
                        Full name
                      </label>
                      <input
                        id="fullName"
                        className={fieldClass}
                        autoComplete="name"
                        {...customerForm.register("fullName")}
                      />
                      <FieldError message={customerForm.formState.errors.fullName?.message} />
                    </div>
                    <div>
                      <label className="font-bold text-buddy-navy" htmlFor="email">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={fieldClass}
                        autoComplete="email"
                        {...customerForm.register("email")}
                      />
                      <FieldError message={customerForm.formState.errors.email?.message} />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-buddy-navy" htmlFor="mobile">
                      Mobile number
                    </label>
                    <input
                      id="mobile"
                      className={fieldClass}
                      autoComplete="tel"
                      {...customerForm.register("mobile")}
                    />
                    <FieldError message={customerForm.formState.errors.mobile?.message} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="font-bold text-buddy-navy" htmlFor="binLocation">
                        Where are bins kept?
                      </label>
                      <select
                        id="binLocation"
                        className={fieldClass}
                        {...customerForm.register("binLocation")}
                      >
                        {BIN_LOCATIONS.map((location) => (
                          <option key={location}>{location}</option>
                        ))}
                      </select>
                      <FieldError message={customerForm.formState.errors.binLocation?.message} />
                    </div>
                    {selectedBinLocation === "Other" ? (
                      <div>
                        <label
                          className="font-bold text-buddy-navy"
                          htmlFor="binLocationOther"
                        >
                          Tell us where
                        </label>
                        <input
                          id="binLocationOther"
                          className={fieldClass}
                          {...customerForm.register("binLocationOther")}
                        />
                        <FieldError
                          message={customerForm.formState.errors.binLocationOther?.message}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label
                      className="font-bold text-buddy-navy"
                      htmlFor="accessInstructions"
                    >
                      Access instructions (optional)
                    </label>
                    <textarea
                      id="accessInstructions"
                      rows={3}
                      className={fieldClass}
                      placeholder="Gate code, where the bins are kept, or anything our cleaner should know."
                      {...customerForm.register("accessInstructions")}
                    />
                    <FieldError
                      message={customerForm.formState.errors.accessInstructions?.message}
                    />
                  </div>
                  <ConsentCheckbox
                    id="termsAccepted"
                    register={customerForm.register("termsAccepted")}
                    error={customerForm.formState.errors.termsAccepted?.message}
                  />
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="submit" size="lg">
                      Review plan
                    </Button>
                  </div>
                </form>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <h2 className="text-2xl font-black text-buddy-navy">
                    Review and pay
                  </h2>
                  <div className="rounded-lg border border-buddy-border bg-buddy-pale p-4">
                    <h3 className="font-black text-buddy-navy">Address</h3>
                    <p className="mt-1 text-slate-700">
                      {address.addressLine1}, {address.postcode}
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {calculation.bins.map((bin) => (
                      <div
                        key={bin.clientId}
                        className="rounded-lg border border-buddy-border bg-white p-4"
                      >
                        <p className="font-black text-buddy-navy">{bin.displayLabel}</p>
                        <p className="mt-1 text-sm text-slate-700">
                          Cleaned once a month
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {collectionSummary(bin)}
                        </p>
                      </div>
                    ))}
                  </div>
                  {differentCollectionDays && collectionDayNotes.trim() ? (
                    <div className="rounded-lg border border-buddy-border bg-buddy-pale p-4">
                      <h3 className="font-black text-buddy-navy">
                        Different collection days
                      </h3>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                        {collectionDayNotes.trim()}
                      </p>
                    </div>
                  ) : null}
                  <p className="rounded-lg bg-buddy-pale px-4 py-3 text-sm font-semibold text-buddy-navy">
                    Your price is securely checked before Stripe Checkout.
                  </p>
                  {checkoutError ? (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {checkoutError}
                    </p>
                  ) : null}
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button type="button" size="lg" disabled={submitting} onClick={startCheckout}>
                      {submitting ? "Starting Checkout..." : "Continue to payment"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <PriceSummary
            calculation={calculation}
            showMobile={showMobilePrice && step > 1}
          />
        </div>
      </div>
    </section>
  );
}

function ProgressIndicator({ step }: { step: number }) {
  return (
    <ol className="flex items-start" aria-label="Signup progress">
      {steps.map((label, index) => {
        const active = index === step;
        const complete = index < step;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center">
            {index < steps.length - 1 ? (
              <span
                className={cn(
                  "absolute left-1/2 right-[-50%] top-4 h-px",
                  complete ? "bg-buddy-green" : "bg-buddy-border",
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-black",
                active || complete
                  ? "border-buddy-green bg-buddy-green text-white"
                  : "border-buddy-border bg-white text-slate-500",
              )}
              aria-current={active ? "step" : undefined}
            >
              {complete ? <Check size={16} aria-hidden /> : index + 1}
            </span>
            <span
              className={cn(
                "mt-2 text-[11px] font-bold leading-tight sm:text-xs",
                active || complete ? "text-buddy-navy" : "text-slate-500",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-2 text-sm font-semibold text-red-700" role="alert">
      {message}
    </p>
  ) : null;
}

function ConsentCheckbox({
  id,
  register,
  error,
}: {
  id: string;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div>
      <div className="rounded-lg border border-buddy-border bg-white p-4">
        <div className="flex items-start gap-3">
          <input
            id={id}
            type="checkbox"
            className="mt-0.5 h-5 w-5 rounded border-buddy-border text-buddy-green focus:ring-buddy-green"
            {...register}
          />
          <label htmlFor={id} className="text-sm font-semibold text-buddy-navy">
            I agree to the{" "}
            <Link href="/terms" className="text-buddy-blue underline-offset-4 hover:underline">
              Terms &amp; Conditions
            </Link>
          </label>
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}
