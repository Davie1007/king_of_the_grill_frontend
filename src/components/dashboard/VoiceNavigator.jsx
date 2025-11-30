import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

// TypeScript prop types (same as before, omitted for brevity)
/** @typedef {Object} VoiceNavigatorProps
 * ... (your existing prop types)
 */

/**
 * VoiceNavigator - Enhanced voice command component for dashboard navigation
 * @param {VoiceNavigatorProps} props
 */
export default function VoiceNavigator({
  section,
  setSection,
  setBranchId,
  setPeriod,
  branches = [],
  metrics = {},
  salesByDayChart = [],
  salesDistribution = [],
  lowStockItems = [],
  cashFlow = 0,
  cashFlowTarget = 0,
  employees = [],
  inventory = [],
  expensesQuery = {},
  formatCurrency,
  savingsPct,
  commandConfig = {
    sections: {
      overview: ["overview", "home", "dashboard"],
      sales: ["sale", "sales"],
      inventory: ["inventory", "stock", "items"],
      employees: ["employee", "staff", "team"],
      expenses: ["expense", "expenses", "costs"],
      payments: ["payment", "payments", "till"],
      branches: ["branch", "branches", "locations"],
    },
    periods: {
      daily: ["daily", "day"],
      weekly: ["weekly", "week"],
      monthly: ["monthly", "month"],
      yearly: ["yearly", "year", "annual"],
    },
  },
  language = "en-US",
  speechRate = 0.95,
  speechPitch = 1,
}) {
  const [listening, setListening] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);
  const restartTimeoutRef = useRef(null);

  // Check for speech recognition support
  const isSpeechRecognitionSupported = useMemo(
    () => window.SpeechRecognition || window.webkitSpeechRecognition,
    []
  );

  // Fallback currency formatter
  const defaultFormatCurrency = useCallback(
    (v) =>
      v === null || v === undefined
        ? "—"
        : new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v),
    []
  );
  const fmt = typeof formatCurrency === "function" ? formatCurrency : defaultFormatCurrency;

  // Safe metrics with fallback values
  const safeMetrics = useMemo(
    () => ({
      totalSales: Number(metrics.totalSales || 0),
      totalExpenses: Number(metrics.totalExpenses || 0),
      grossProfit: Number(metrics.grossProfit || 0),
      savings: Number(metrics.savings || 0),
      netProfit: Number(metrics.netProfit || 0),
      level: Number(metrics.level || 0),
      xp: Number(metrics.xp || 0),
    }),
    [metrics]
  );

  // Cache available voices
  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    const loadVoices = () => {
      try {
        if (typeof window.speechSynthesis !== 'undefined') {
          const voices = window.speechSynthesis.getVoices();
          voicesRef.current = voices.filter((v) => v.lang.startsWith(language.split("-")[0]));
        }
      } catch (e) {
        console.warn('Speech synthesis not supported on this device');
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [language, isSpeechRecognitionSupported]);

  // Request microphone permission
  useEffect(() => {
    if (!isSpeechRecognitionSupported || !listening) return;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setPermissionGranted(true);
        setErrorMessage(null);
      })
      .catch((err) => {
        console.error("Microphone permission error:", err);
        setPermissionGranted(false);
        setErrorMessage(
          `Microphone access denied: ${err.message}. Please enable microphone permissions in your browser settings.`
        );
        setListening(false);
      });
  }, [listening, isSpeechRecognitionSupported]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      setErrorMessage(
        "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Speech recognition started.");
      setErrorMessage(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const transcript = (finalTranscript || interimTranscript).trim().toLowerCase();
      console.log("VoiceNavigator heard:", transcript);

      if (transcript) {
        for (const [sectionName, triggers] of Object.entries(commandConfig.sections)) {
          if (triggers.some((trigger) => transcript.includes(trigger))) {
            setSection(sectionName.charAt(0).toUpperCase() + sectionName.slice(1));
            return;
          }
        }

        if (setPeriod) {
          for (const [periodName, triggers] of Object.entries(commandConfig.periods)) {
            if (triggers.some((trigger) => transcript.includes(trigger))) {
              setPeriod(periodName);
              return;
            }
          }
        }

        if (setBranchId) {
          for (const branch of branches) {
            const name = (branch.name || "").toLowerCase();
            if (name && transcript.includes(name)) {
              console.log("Switching to branch:", branch.name);
              setBranchId(branch.id);
              return;
            }
          }
        }
      }
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err.error, err.message);
      let message = `Error: ${err.error} - ${err.message}`;
      if (err.error === "no-speech") {
        message = "No speech detected. Listening again...";
      } else if (err.error === "not-allowed") {
        message = "Microphone access not allowed. Please grant permission.";
        setPermissionGranted(false);
      } else if (err.error === "network") {
        message = "Network error. Please check your internet connection.";
      }
      setErrorMessage(message);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      if (listening && permissionGranted) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
            console.log("Restarting recognition...");
          } catch (e) {
            console.warn("Failed to restart recognition:", e);
            setErrorMessage("Failed to restart listening. Please toggle again.");
            setListening(false);
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [
    language,
    setSection,
    setBranchId,
    setPeriod,
    branches,
    commandConfig,
    permissionGranted,
    listening,
    isSpeechRecognitionSupported,
  ]);

  // Generate narrative on section change
  const speakNarrative = useCallback(() => {
    if (!listening || !window.speechSynthesis) {
      console.warn("Speech synthesis not available or not listening.");
      return;
    }

    const textParts = [];
    switch (section) {
      case "Overview":
        textParts.push("Welcome to the Overview dashboard.");
        textParts.push(`Total sales are ${fmt(safeMetrics.totalSales)}.`);
        textParts.push(`Total expenses are ${fmt(safeMetrics.totalExpenses)}.`);
        textParts.push(`Gross profit is ${fmt(safeMetrics.grossProfit)}.`);
        const pct = typeof savingsPct === "number" ? savingsPct : metrics?.savingsPct ?? 0.2;
        textParts.push(
          `Savings are set at ${Math.round(pct * 100)} percent, resulting in ${fmt(
            safeMetrics.savings
          )} saved and a net profit of ${fmt(safeMetrics.netProfit)}.`
        );
        textParts.push(`Cash flow is ${fmt(cashFlow)} against a target of ${fmt(cashFlowTarget)}.`);
        textParts.push(`There are ${lowStockItems.length} low stock items.`);
        if (lowStockItems.length) {
          const names = lowStockItems
            .slice(0, 6)
            .map((i) => i.name || i.item || "unnamed")
            .join(", ");
          textParts.push(`Some low stock items include: ${names}.`);
        }
        textParts.push(`You are at level ${safeMetrics.level} with ${Math.round(safeMetrics.xp)} XP.`);
        break;

      case "Sales":
        textParts.push("You are in the Sales section.");
        textParts.push(`Total sales amount to ${fmt(safeMetrics.totalSales)}.`);
        const days = salesByDayChart.length || 1;
        const lastDayTotal = salesByDayChart.slice(-1)[0]?.total ?? 0;
        textParts.push(
          `Sales data covers ${days} day${days > 1 ? "s" : ""}. The most recent day totals ${fmt(
            lastDayTotal
          )}.`
        );
        const avg = safeMetrics.totalSales / days;
        textParts.push(`Average daily sales are ${fmt(avg)}.`);
        if (salesDistribution?.length) {
          const top = salesDistribution
            .slice(0, 3)
            .map((s) => `${s.name} with ${s.value} units`)
            .join(", ");
          textParts.push(`Top selling items are: ${top}.`);
        }
        break;

      case "Inventory":
        textParts.push("You are in the Inventory section.");
        textParts.push(`You have ${inventory.length} products in inventory.`);
        textParts.push(`There are ${lowStockItems.length} low stock items.`);
        if (lowStockItems.length) {
          const lowNames = lowStockItems
            .slice(0, 6)
            .map((i) => `${i.name} with ${i.stock} units`)
            .join(", ");
          textParts.push(`Examples include: ${lowNames}.`);
        }
        textParts.push("Use the reorder and pricing tools to manage stock and margins.");
        break;

      case "Employees":
        textParts.push("You are in the Employees section.");
        textParts.push(`You have ${employees.length} employees.`);
        const suspended = employees.filter((e) => e.suspended).length;
        if (suspended) textParts.push(`${suspended} employees are currently suspended.`);
        textParts.push("You can add, edit, suspend, transfer, or remove staff here.");
        break;

      case "Expenses":
        textParts.push("You are in the Expenses section.");
        const expArr = expensesQuery?.data || [];
        textParts.push(
          `Total expenses recorded are ${fmt(safeMetrics.totalExpenses)} across ${
            expArr.length
          } entries.`
        );
        if (expArr?.length) {
          const top3 = expArr
            .slice(0, 3)
            .map((e) => `${e.title || e.category || "entry"}: ${fmt(e.amount ?? 0)}`)
            .join(", ");
          textParts.push(`Recent expenses include: ${top3}.`);
        }
        break;

      case "Payments":
        textParts.push("You are in the Payments section.");
        textParts.push("Review customer payments, till transactions, and export reports here.");
        break;

      case "Branches":
        textParts.push("You are in the Branches section.");
        textParts.push(`You manage ${branches.length} branches.`);
        if (branches.length) {
          const firstFew = branches.slice(0, 4).map((b) => b.name).join(", ");
          textParts.push(`Your branches include: ${firstFew}.`);
        }
        break;

      default:
        textParts.push(`You are viewing the ${section} section.`);
        break;
    }

    const narrative = textParts.join(" ");
    if (narrative) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(narrative);
        utter.lang = language;
        utter.rate = speechRate;
        utter.pitch = speechPitch;
        const voice = voicesRef.current.find((v) => v.lang === language) || voicesRef.current[0];
        if (voice) utter.voice = voice;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn("Speech synthesis error:", e);
        setErrorMessage("Failed to speak narrative. Check console for details.");
      }
    }
  }, [
    section,
    listening,
    safeMetrics,
    salesByDayChart,
    salesDistribution,
    lowStockItems,
    cashFlow,
    cashFlowTarget,
    employees,
    inventory,
    expensesQuery,
    branches,
    fmt,
    savingsPct,
    language,
    speechRate,
    speechPitch,
  ]);

  // Trigger narrative on section change when listening
  useEffect(() => {
    if (listening && isSpeechRecognitionSupported) speakNarrative();
  }, [listening, section, speakNarrative, isSpeechRecognitionSupported]);

  // Toggle listening with accessibility
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setErrorMessage("Speech recognition not initialized. Check browser compatibility.");
      return;
    }

    if (listening) {
      try {
        recognitionRef.current.stop();
        window.speechSynthesis.cancel();
        setListening(false);
      } catch (e) {
        console.error("Failed to stop recognition:", e);
        setErrorMessage("Failed to stop listening. Check console for details.");
      }
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setErrorMessage("Failed to start listening. Check console for details.");
      }
    }
  }, [listening]);

  // Handle keyboard accessibility
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleListening();
      }
    },
    [toggleListening]
  );

  // If speech recognition is not supported, don't render the button
  if (!isSpeechRecognitionSupported) {
    return null;
  }

  return (
    <button
      id="voice"
      onClick={toggleListening}
      onKeyDown={handleKeyDown}
      aria-pressed={listening}
      aria-label={listening ? "Stop voice commands" : "Start voice commands"}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: 12,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: listening ? "#007AFF" : "#666",
        color: "#fff",
        border: "none",
        fontSize: 22,
        boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
        cursor: "pointer",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={listening ? "Listening — click to stop" : "Click to start voice commands"}
    >
      <span role="img" aria-label="Microphone">
        🎤
      </span>
    </button>
  );
}