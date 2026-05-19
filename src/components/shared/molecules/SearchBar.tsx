"use client";

import React from "react";
import Icon from "@/components/shared/atoms/Icon";
import Button from "@/components/shared/atoms/Button";
import { useRouter } from "next/navigation";
import {
  getTomorrowDateInputValue,
  isBookableDateRange,
} from "@/utils/dateInput";

interface SearchFilters {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
}

interface SearchBarProps {
  className?: string;
  destinations?: string[];
  topDestinations?: string[];
  defaultFilters?: Partial<SearchFilters>;
  onSearch?: (filters: SearchFilters) => void;
  resetSignal?: number;
}

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const SearchBar: React.FC<SearchBarProps> = ({
  className = "",
  destinations = [],
  topDestinations = [],
  defaultFilters,
  onSearch,
  resetSignal = 0,
}) => {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const datePickerRef = React.useRef<HTMLDivElement>(null);
  const [destinationInput, setDestinationInput] = React.useState("");
  const [selectedDestination, setSelectedDestination] = React.useState<
    string | null
  >(null);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [travelers, setTravelers] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [warning, setWarning] = React.useState("");
  const minimumStartDate = React.useMemo(() => getTomorrowDateInputValue(), []);
  const minimumEndDate = startDate || minimumStartDate;
  const defaultDestination = defaultFilters?.destination?.trim() ?? "";
  const defaultStartDate = defaultFilters?.startDate ?? "";
  const defaultEndDate = defaultFilters?.endDate ?? "";
  const defaultTravelers =
    typeof defaultFilters?.travelers === "number" &&
    defaultFilters.travelers >= 1 &&
    defaultFilters.travelers <= 30
      ? String(defaultFilters.travelers)
      : "";

  const requiresSelection = destinations.length > 0;

  const uniqueDestinations = React.useMemo(() => {
    return Array.from(
      new Set(destinations.map((item) => item.trim()).filter(Boolean)),
    );
  }, [destinations]);

  const fallbackTop = React.useMemo(() => {
    if (topDestinations.length) {
      return topDestinations;
    }
    return uniqueDestinations.slice(0, 8);
  }, [topDestinations, uniqueDestinations]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setShowSuggestions(false);
        setShowCalendar(false);
        return;
      }
      if (datePickerRef.current && !datePickerRef.current.contains(target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    setDestinationInput("");
    setSelectedDestination(null);
    setStartDate("");
    setEndDate("");
    setTravelers("");
    setWarning("");
    setShowSuggestions(false);
    setShowCalendar(false);
  }, [resetSignal]);

  React.useEffect(() => {
    setDestinationInput(defaultDestination);
    setSelectedDestination(defaultDestination || null);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setTravelers(defaultTravelers);
    setWarning("");
  }, [
    defaultDestination,
    defaultStartDate,
    defaultEndDate,
    defaultTravelers,
  ]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(destinationInput);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [destinationInput]);

  React.useEffect(() => {
    if (!requiresSelection) {
      setSelectedDestination(destinationInput.trim() || null);
      return;
    }
    const match = uniqueDestinations.find(
      (item) => normalizeToken(item) === normalizeToken(destinationInput),
    );
    setSelectedDestination(match ?? null);
  }, [destinationInput, requiresSelection, uniqueDestinations]);

  const filteredSuggestions = React.useMemo(() => {
    if (!requiresSelection) {
      return [];
    }
    const query = normalizeToken(debouncedQuery);
    if (!query) {
      return fallbackTop.slice(0, 8);
    }
    return uniqueDestinations
      .filter((item) => normalizeToken(item).includes(query))
      .slice(0, 8);
  }, [requiresSelection, debouncedQuery, fallbackTop, uniqueDestinations]);

  const dateLabel = startDate && endDate ? `${startDate} - ${endDate}` : "";

  const handleDestinationChange = (value: string) => {
    setDestinationInput(value);
    setWarning("");
    if (requiresSelection) {
      setShowSuggestions(true);
    }
  };

  const handleDestinationSelect = (value: string) => {
    setDestinationInput(value);
    setSelectedDestination(value);
    setShowSuggestions(false);
    setWarning("");
  };

  const handleTravelersChange = (value: string) => {
    if (value === "") {
      setTravelers("");
      return;
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return;
    }
    const clamped = Math.min(30, Math.max(1, numericValue));
    setTravelers(String(clamped));
  };

  const handleStartDateChange = (value: string) => {
    setWarning("");
    if (value && value < minimumStartDate) {
      setStartDate("");
      setEndDate("");
      setWarning("La fecha inicial debe ser desde mañana en adelante.");
      return;
    }
    setStartDate(value);
    if (endDate && value && endDate < value) {
      setEndDate("");
    }
  };

  const handleEndDateChange = (value: string) => {
    setWarning("");
    if (value && value < minimumEndDate) {
      setEndDate("");
      setWarning("La fecha final no puede ser anterior a la inicial.");
      return;
    }
    setEndDate(value);
  };

  const handleSearch = () => {
    const destinationValue = selectedDestination ?? destinationInput.trim();
    if (!destinationValue || (requiresSelection && !selectedDestination)) {
      setWarning("Selecciona un destino de la lista para continuar.");
      return;
    }
    if (!startDate || !endDate) {
      setWarning("Selecciona un rango de fechas para continuar.");
      return;
    }
    if (startDate < minimumStartDate) {
      setWarning("La fecha inicial debe ser desde mañana en adelante.");
      return;
    }
    if (!isBookableDateRange(startDate, endDate, minimumStartDate)) {
      setWarning("La fecha final no puede ser anterior a la inicial.");
      return;
    }
    const travelersValue = Number(travelers);
    if (
      Number.isNaN(travelersValue) ||
      travelersValue < 1 ||
      travelersValue > 30
    ) {
      setWarning("Ingresa un número de viajeros entre 1 y 30.");
      return;
    }

    setWarning("");

    if (onSearch) {
      onSearch({
        destination: destinationValue,
        startDate,
        endDate,
        travelers: travelersValue,
      });
      return;
    }

    const params = new URLSearchParams();
    params.append("destino", destinationValue);
    params.append("fecha_inicio", startDate);
    params.append("fecha_fin", endDate);
    params.append("viajeros", String(travelersValue));
    router.push(`/planes?${params.toString()}`);
  };

  return (
    <div ref={containerRef} className={`w-full max-w-5xl ${className}`}>
      <div className="w-full bg-white p-2 md:p-3 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2">
        <div
          ref={datePickerRef}
          className="relative flex-1 w-full flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100"
        >
          <Icon name="location_on" className="text-primary" />
          <div className="flex flex-col items-start w-full">
            <span className="text-[10px] font-bold uppercase text-slate-600">
              Destino
            </span>
            <input
              className="w-full border-0 p-0 text-sm font-semibold focus:ring-0 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="¿A dónde quieres ir?"
              type="text"
              value={destinationInput}
              onChange={(event) => handleDestinationChange(event.target.value)}
              onFocus={() => {
                if (requiresSelection) {
                  setShowSuggestions(true);
                }
              }}
            />
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
              {filteredSuggestions.map((option) => (
                <button
                  key={option}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                  type="button"
                  onMouseDown={() => handleDestinationSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex-1 w-full flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100">
          <Icon name="calendar_today" className="text-primary" />
          <div className="flex flex-col items-start w-full">
            <span className="text-[10px] font-bold uppercase text-slate-600">
              Fechas
            </span>
            <button
              className="w-full border-0 p-0 text-sm font-semibold focus:ring-0 bg-transparent text-left text-slate-900 placeholder:text-slate-400 outline-none"
              type="button"
              onClick={() => setShowCalendar((prev) => !prev)}
            >
              {dateLabel || "Seleccionar fechas"}
            </button>
          </div>
          {showCalendar && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-500">
                  Desde
                  <input
                    className="mt-1 w-full rounded-lg border-slate-200 text-sm focus:border-primary focus:ring-primary"
                    type="date"
                    min={minimumStartDate}
                    value={startDate}
                    onChange={(event) =>
                      handleStartDateChange(event.target.value)
                    }
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Hasta
                  <input
                    className="mt-1 w-full rounded-lg border-slate-200 text-sm focus:border-primary focus:ring-primary"
                    type="date"
                    min={minimumEndDate}
                    value={endDate}
                    onChange={(event) =>
                      handleEndDateChange(event.target.value)
                    }
                  />
                </label>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  className="text-xs font-semibold text-primary uppercase tracking-wider"
                  type="button"
                  onClick={() => setShowCalendar(false)}
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 w-full flex items-center gap-3 px-6 py-3">
          <Icon name="group" className="text-primary" />
          <div className="flex flex-col items-start w-full">
            <span className="text-[10px] font-bold uppercase text-slate-600">
              Viajeros
            </span>
            <input
              className="w-full border-0 p-0 text-sm font-semibold focus:ring-0 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="Personas"
              type="number"
              min={1}
              max={30}
              inputMode="numeric"
              value={travelers}
              onChange={(event) => handleTravelersChange(event.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full md:w-auto px-10 py-4 rounded-full text-base font-bold normal-case tracking-normal shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 cursor-pointer"
          onClick={handleSearch}
          type="button"
        >
          <Icon name="search" className="text-base" />
          Buscar
        </Button>
      </div>
      {warning && (
        <p className="mt-2 text-sm font-semibold text-red-500 text-center">
          {warning}
        </p>
      )}
    </div>
  );
};

export default SearchBar;
