"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Edit3,
  Home,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { trackSignupEvent } from "@/components/analytics";
import { PriceSummary } from "@/components/signup/price-summary";
import { Button } from "@/components/ui/button";
import {
  BIN_LOCATIONS,
  BIN_TYPE_LABELS,
  BIN_TYPES,
  CLEANING_FREQUENCIES,
  COLLECTION_DAYS,
  COLLECTION_FREQUENCIES,
  type BinType,
} from "@/lib/constants";
import { DEFAULT_PRICING_RULES, calculatePlanTotal, collectionSummary } from "@/lib/pricing";
import {
  addressSchema,
  customerDetailsSchema,
  planBinInputSchema,
  signupSchema,
  type AddressInput,
  type CustomerDetailsInput,
  type PlanBinInput,
} from "@/lib/schemas";
import { addPlanBin, removePlanBin, updatePlanBin } from "@/lib/signup-state";
import { cn, todayInputValue } from "@/lib/utils";

const steps = [
  { title: "Postcode and address", icon: Home },
  { title: "Choose bins", icon: Plus },
  { title: "Collection information", icon: CalendarDays },
  { title: "Customer details", icon: CheckCircle2 },
  { title: "Review and payment", icon: CreditCard },
] as const;

const fieldClass =
  "mt-2 w-full rounded-2xl border border-buddy-border bg-white px-4 py-3 text-base text-buddy-navy shadow-sm focus:border-buddy-blue focus:outline-none focus:ring-4 focus:ring-buddy-blue/15";

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
  arrangementAccepted: false,
};

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

function createDraftBin(binType: BinType = "general_waste"): PlanBinInput {
  return {
    clientId: newClientId(),
    binType,
    cleaningFrequencyWeeks: 4,
    collectionDay: "Tuesday",
    collectionFrequency: "weekly",
    nextCollectionDate: "",
  };
}

export function SignupFlow() {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<AddressInput>(blankAddress);
  const [addressError, setAddressError] = useState<string>("");
  const [bins, setBins] = useState<PlanBinInput[]>([]);
  const [draftBin, setDraftBin] = useState<PlanBinInput>(createDraftBin());
  const [editingId, setEditingId] = useState<string | null>(null);
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

  function updateAddress<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setAddress((current) => ({ ...current, [key]: value }));
  }

  function continueFromAddress() {
    const parsed = addressSchema.safeParse(address);
    if (!parsed.success) {
      setAddressError("Please enter a valid UK address.");
      return;
    }

    setAddress(parsed.data);
    setAddressError("");
    setStep(1);
    trackSignupEvent("postcode_completed");
  }

  function saveDraftBin() {
    const parsed = planBinInputSchema.safeParse(draftBin);
    if (!parsed.success) {
      setBinError(
        parsed.error.issues[0]?.message ||
          "Please check the bin collection details.",
      );
      return;
    }

    const isDuplicate =
      !editingId && bins.some((bin) => bin.binType === parsed.data.binType);
    if (
      isDuplicate &&
      !window.confirm(
        `You already added ${BIN_TYPE_LABELS[parsed.data.binType]}. Add another one?`,
      )
    ) {
      return;
    }

    if (editingId) {
      setBins((current) => updatePlanBin(current, editingId, parsed.data));
    } else {
      const result = addPlanBin(bins, parsed.data);
      setBins(result.bins);
      trackSignupEvent(result.duplicate ? "additional_bin_added" : "bin_added");
    }

    setDraftBin(createDraftBin(parsed.data.binType));
    setEditingId(null);
    setBinError("");
  }

  function editBin(bin: PlanBinInput) {
    setDraftBin(bin);
    setEditingId(bin.clientId);
    setBinError("");
    setStep(1);
  }

  function continueFromBins() {
    if (bins.length === 0) {
      setBinError("Add at least one bin to continue.");
      return;
    }
    setBinError("");
    setStep(2);
  }

  function continueFromCollection() {
    setStep(3);
  }

  const continueFromCustomer = customerForm.handleSubmit((values) => {
    customerForm.reset(values);
    setStep(4);
    trackSignupEvent("customer_details_completed");
  });

  async function startCheckout() {
    setCheckoutError("");
    setSubmitting(true);

    const parsed = signupSchema.safeParse({
      address,
      bins,
      customer: customerForm.getValues(),
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
    <section id="signup" ref={signupRef} className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
            Get started
          </p>
          <h2 className="mt-3 text-3xl font-black text-buddy-navy sm:text-4xl">
            Set up your BuddyBin plan
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Choose your bins, tell us the council collection schedule and move to
            one simple monthly payment.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[28px] border border-buddy-border bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <ol className="grid gap-2 sm:grid-cols-5" aria-label="Signup progress">
              {steps.map((item, index) => {
                const Icon = item.icon;
                const active = index === step;
                const complete = index < step;
                return (
                  <li key={item.title}>
                    <button
                      type="button"
                      onClick={() => index < step && setStep(index)}
                      className={cn(
                        "flex min-h-16 w-full flex-col items-start justify-center rounded-2xl border px-3 py-2 text-left text-xs font-bold transition",
                        active
                          ? "border-buddy-green bg-buddy-pale text-buddy-navy"
                          : complete
                            ? "border-buddy-border bg-white text-buddy-navy"
                            : "border-buddy-border bg-slate-50 text-slate-500",
                      )}
                      aria-current={active ? "step" : undefined}
                    >
                      <Icon size={18} aria-hidden />
                      <span className="mt-2">{item.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8">
              {step === 0 ? (
                <div className="space-y-5">
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
                  <div>
                    <label className="font-bold text-buddy-navy" htmlFor="addressLine1">
                      Address line 1
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
                    <label className="font-bold text-buddy-navy" htmlFor="addressLine2">
                      Address line 2 optional
                    </label>
                    <input
                      id="addressLine2"
                      className={fieldClass}
                      value={address.addressLine2 || ""}
                      onChange={(event) =>
                        updateAddress("addressLine2", event.target.value)
                      }
                      autoComplete="address-line2"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="font-bold text-buddy-navy" htmlFor="town">
                        Town or city
                      </label>
                      <input
                        id="town"
                        className={fieldClass}
                        value={address.town}
                        onChange={(event) => updateAddress("town", event.target.value)}
                        autoComplete="address-level2"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-buddy-navy" htmlFor="county">
                        County optional
                      </label>
                      <input
                        id="county"
                        className={fieldClass}
                        value={address.county || ""}
                        onChange={(event) =>
                          updateAddress("county", event.target.value)
                        }
                        autoComplete="address-level1"
                      />
                    </div>
                  </div>
                  {addressError ? (
                    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {addressError}
                    </p>
                  ) : null}
                  <Button type="button" onClick={continueFromAddress}>
                    Continue
                  </Button>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-buddy-navy">
                      Choose and configure a bin
                    </h3>
                    <p className="mt-2 text-slate-600">
                      Each bin can have its own cleaning frequency and council
                      collection schedule.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {BIN_TYPES.map((bin) => (
                      <button
                        type="button"
                        key={bin.value}
                        onClick={() =>
                          setDraftBin((current) => ({
                            ...current,
                            binType: bin.value,
                          }))
                        }
                        className={cn(
                          "min-h-24 rounded-2xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-buddy-blue/15",
                          draftBin.binType === bin.value
                            ? "border-buddy-green bg-buddy-pale"
                            : "border-buddy-border bg-white hover:border-buddy-blue",
                        )}
                      >
                        <span
                          className="mb-3 block h-8 w-8 rounded-lg"
                          style={{ backgroundColor: bin.colour }}
                          aria-hidden
                        />
                        <span className="font-bold text-buddy-navy">{bin.label}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <p className="font-bold text-buddy-navy">Cleaning frequency</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {CLEANING_FREQUENCIES.map((frequency) => (
                        <button
                          key={frequency.value}
                          type="button"
                          onClick={() =>
                            setDraftBin((current) => ({
                              ...current,
                              cleaningFrequencyWeeks: frequency.value,
                            }))
                          }
                          className={cn(
                            "min-h-20 rounded-2xl border px-4 py-3 text-left font-bold transition",
                            draftBin.cleaningFrequencyWeeks === frequency.value
                              ? "border-buddy-green bg-buddy-pale text-buddy-navy"
                              : "border-buddy-border bg-white text-buddy-navy",
                          )}
                        >
                          {frequency.label}
                          {"badge" in frequency ? (
                            <span className="mt-2 block text-xs text-buddy-green">
                              {frequency.badge}
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="font-bold text-buddy-navy" htmlFor="collectionDay">
                        Council collection day
                      </label>
                      <select
                        id="collectionDay"
                        className={fieldClass}
                        value={draftBin.collectionDay}
                        onChange={(event) =>
                          setDraftBin((current) => ({
                            ...current,
                            collectionDay: event.target.value as PlanBinInput["collectionDay"],
                          }))
                        }
                      >
                        {COLLECTION_DAYS.map((day) => (
                          <option key={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="font-bold text-buddy-navy"
                        htmlFor="collectionFrequency"
                      >
                        Council collection frequency
                      </label>
                      <select
                        id="collectionFrequency"
                        className={fieldClass}
                        value={draftBin.collectionFrequency}
                        onChange={(event) =>
                          setDraftBin((current) => ({
                            ...current,
                            collectionFrequency:
                              event.target.value as PlanBinInput["collectionFrequency"],
                            nextCollectionDate:
                              event.target.value === "every_two_weeks"
                                ? current.nextCollectionDate || todayInputValue()
                                : "",
                          }))
                        }
                      >
                        {COLLECTION_FREQUENCIES.map((frequency) => (
                          <option key={frequency.value} value={frequency.value}>
                            {frequency.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {draftBin.collectionFrequency === "every_two_weeks" ? (
                    <div>
                      <label
                        className="font-bold text-buddy-navy"
                        htmlFor="nextCollectionDate"
                      >
                        When is the next collection?
                      </label>
                      <input
                        id="nextCollectionDate"
                        className={fieldClass}
                        type="date"
                        min={todayInputValue()}
                        value={draftBin.nextCollectionDate || ""}
                        onChange={(event) =>
                          setDraftBin((current) => ({
                            ...current,
                            nextCollectionDate: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ) : null}

                  {binError ? (
                    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {binError}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={saveDraftBin}>
                      {editingId ? "Save bin" : "Add bin"}
                    </Button>
                    {editingId ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setDraftBin(createDraftBin());
                          setEditingId(null);
                        }}
                      >
                        Cancel edit
                      </Button>
                    ) : null}
                    <Button type="button" variant="navy" onClick={continueFromBins}>
                      Continue
                    </Button>
                  </div>

                  {bins.length > 0 ? (
                    <div className="grid gap-3">
                      {calculation.bins.map((bin) => (
                        <div
                          key={bin.clientId}
                          className="rounded-2xl border border-buddy-border bg-buddy-pale p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-black text-buddy-navy">
                                {bin.displayLabel}
                              </h4>
                              <p className="mt-1 text-sm text-slate-700">
                                Cleaned every {bin.cleaningFrequencyWeeks} weeks
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                {collectionSummary(bin)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                aria-label={`Edit ${bin.displayLabel}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-buddy-navy shadow-sm"
                                onClick={() => editBin(bin)}
                              >
                                <Edit3 size={18} aria-hidden />
                              </button>
                              <button
                                type="button"
                                aria-label={`Remove ${bin.displayLabel}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-700 shadow-sm"
                                onClick={() =>
                                  setBins((current) => removePlanBin(current, bin.clientId))
                                }
                              >
                                <Trash2 size={18} aria-hidden />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <h3 className="text-2xl font-black text-buddy-navy">
                    Collection information
                  </h3>
                  <p className="text-slate-600">
                    BuddyBin uses these council collection details to arrange
                    cleaning around your collection schedule.
                  </p>
                  <div className="grid gap-3">
                    {calculation.bins.map((bin) => (
                      <div
                        key={bin.clientId}
                        className="rounded-2xl border border-buddy-border bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-black text-buddy-navy">{bin.displayLabel}</p>
                            <p className="mt-1 text-sm text-slate-700">
                              {collectionSummary(bin)}
                            </p>
                          </div>
                          <Button type="button" variant="secondary" size="sm" onClick={() => editBin(bin)}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                      + Add another bin
                    </Button>
                    <Button type="button" onClick={continueFromCollection}>
                      Continue
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <form className="space-y-5" onSubmit={continueFromCustomer}>
                  <h3 className="text-2xl font-black text-buddy-navy">
                    Customer details
                  </h3>
                  <div className="grid gap-5 sm:grid-cols-2">
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
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="font-bold text-buddy-navy" htmlFor="binLocation">
                        Where are bins normally left?
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
                      Access instructions optional
                    </label>
                    <textarea
                      id="accessInstructions"
                      rows={4}
                      className={fieldClass}
                      {...customerForm.register("accessInstructions")}
                    />
                    <FieldError
                      message={customerForm.formState.errors.accessInstructions?.message}
                    />
                  </div>
                  <ConsentCheckbox
                    id="termsAccepted"
                    label="I agree to the Terms and Conditions."
                    register={customerForm.register("termsAccepted")}
                    error={customerForm.formState.errors.termsAccepted?.message}
                  />
                  <ConsentCheckbox
                    id="arrangementAccepted"
                    label="I understand that BuddyBin arranges the service through an independent local cleaning partner."
                    register={customerForm.register("arrangementAccepted")}
                    error={customerForm.formState.errors.arrangementAccepted?.message}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button type="submit">Review plan</Button>
                  </div>
                </form>
              ) : null}

              {step === 4 ? (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-buddy-navy">
                    Review and payment
                  </h3>
                  <div className="rounded-2xl border border-buddy-border bg-buddy-pale p-5">
                    <h4 className="font-black text-buddy-navy">Address</h4>
                    <p className="mt-2 text-slate-700">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""},{" "}
                      {address.town}, {address.postcode}
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {calculation.bins.map((bin) => (
                      <div
                        key={bin.clientId}
                        className="rounded-2xl border border-buddy-border bg-white p-4"
                      >
                        <p className="font-black text-buddy-navy">{bin.displayLabel}</p>
                        <p className="mt-1 text-sm text-slate-700">
                          Cleaned every {bin.cleaningFrequencyWeeks} weeks
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {collectionSummary(bin)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="rounded-2xl bg-buddy-pale px-4 py-3 text-sm font-semibold text-buddy-navy">
                    Prices are recalculated securely on the server before Stripe
                    Checkout starts.
                  </p>
                  {checkoutError ? (
                    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {checkoutError}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" onClick={() => setStep(3)}>
                      Back
                    </Button>
                    <Button type="button" disabled={submitting} onClick={startCheckout}>
                      {submitting ? "Starting Checkout..." : "Continue to payment"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <PriceSummary calculation={calculation} showMobile={showMobilePrice} />
        </div>
      </div>
    </section>
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
  label,
  register,
  error,
}: {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-start gap-3 rounded-2xl border border-buddy-border bg-white p-4 text-sm font-semibold text-buddy-navy"
      >
        <input
          id={id}
          type="checkbox"
          className="mt-1 h-5 w-5 rounded border-buddy-border text-buddy-green focus:ring-buddy-green"
          {...register}
        />
        <span>{label}</span>
      </label>
      <FieldError message={error} />
    </div>
  );
}
