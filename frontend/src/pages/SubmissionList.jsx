import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/UI/Card";
import Badge from "../components/UI/Badge";
import Button from "../components/UI/Button";
import { useNavigate, Link } from "react-router-dom";

import {
  Search,
  SlidersHorizontal,
  Languages,
  History,
  SortAsc,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedVerdict, setSelectedVerdict] = useState("All");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showLanguageFilter, setShowLanguageFilter] = useState(false);
  const [showVerdictFilter, setShowVerdictFilter] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  const languageFilterRef = useRef(null);
  const verdictFilterRef = useRef(null);
  const sortOptionsRef = useRef(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/submissions/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageFilterRef.current &&
        !languageFilterRef.current.contains(event.target)
      ) {
        setShowLanguageFilter(false);
      }
      if (
        verdictFilterRef.current &&
        !verdictFilterRef.current.contains(event.target)
      ) {
        setShowVerdictFilter(false);
      }
      if (
        sortOptionsRef.current &&
        !sortOptionsRef.current.contains(event.target)
      ) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredAndSortedSubmissions = useMemo(() => {
    let tempSubmissions = [...submissions];

    if (debouncedSearchTerm) {
      tempSubmissions = tempSubmissions.filter(
        (sub) =>
          sub.problem?.title
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          sub.language
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (selectedLanguage !== "All") {
      tempSubmissions = tempSubmissions.filter(
        (sub) => sub.language === selectedLanguage
      );
    }

    if (selectedVerdict !== "All") {
      tempSubmissions = tempSubmissions.filter(
        (sub) => sub.verdict === selectedVerdict
      );
    }

    tempSubmissions.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "submittedAt") {
        compareValue = new Date(a.submittedAt) - new Date(b.submittedAt);
      } else if (sortBy === "problemTitle") {
        compareValue = (a.problem?.title || "").localeCompare(
          b.problem?.title || ""
        );
      } else if (sortBy === "language") {
        compareValue = (a.language || "").localeCompare(b.language || "");
      } else if (sortBy === "verdict") {
        compareValue = (a.verdict || "").localeCompare(b.verdict || "");
      } else if (sortBy === "runtime") {
        compareValue = (a.runtime || 0) - (b.runtime || 0);
      } else if (sortBy === "memory") {
        compareValue = (a.memory || 0) - (b.memory || 0);
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return tempSubmissions;
  }, [
    submissions,
    debouncedSearchTerm,
    selectedLanguage,
    selectedVerdict,
    sortBy,
    sortOrder,
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusBadgeVariant = (verdict) => {
    switch (verdict) {
      case "Accepted":
        return "success";
      case "Wrong Answer":
        return "danger";
      case "Time Limit Exceeded":
        return "warning";
      case "Runtime Error":
        return "info";
      case "Compilation Error":
        return "danger";
      case "Pending":
        return "default";
      case "Error":
        return "dark";
      default:
        return "default";
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
    setCurrentPage(1);
    setShowSortOptions(false);
  };

  const uniqueLanguages = useMemo(() => {
    const langs = new Set(submissions.map((sub) => sub.language));
    return ["All", ...Array.from(langs).sort()];
  }, [submissions]);

  const uniqueVerdicts = useMemo(() => {
    const verdicts = new Set(submissions.map((sub) => sub.verdict));
    return ["All", ...Array.from(verdicts).sort()];
  }, [submissions]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLanguage("All");
    setSelectedVerdict("All");
    setSortBy("submittedAt");
    setSortOrder("desc");
  };

  return (
    <>
      <title>Submissions | CodeSlayer</title>
      <meta
        name="description"
        content="View your recent code submissions, verdicts, and performance analytics on CodeSlayer."
      />
      <div className="container mx-auto p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white font-sans">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-400">
            Submission History
          </h1>
          {/* No 'Add New Submission' button here, naturally */}
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        {/* Filter and Search Section - Mimicking ProblemList's layout */}
        <div className="mb-6 bg-neutral-900 p-5 rounded-lg shadow-xl border border-neutral-700">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Search Bar */}
            <div className="relative flex-grow min-w-[200px] max-w-sm">
              <input
                type="text"
                placeholder="Search problems or language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              {searchTerm && (
                <XCircle
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white"
                  size={20}
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            {/* Language Filter Dropdown */}
            <div className="relative" ref={languageFilterRef}>
              <Button
                variant="secondary"
                onClick={() => setShowLanguageFilter(!showLanguageFilter)}
                className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-4 py-2 rounded-lg"
              >
                <Languages size={20} />
                <span>
                  Language:{" "}
                  {selectedLanguage === "All" ? "All" : selectedLanguage}
                </span>
              </Button>
              {showLanguageFilter && (
                <div className="absolute z-10 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-2">
                  {uniqueLanguages.map((lang) => (
                    <label
                      key={lang}
                      className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="language"
                        value={lang}
                        checked={selectedLanguage === lang}
                        onChange={() => {
                          setSelectedLanguage(lang);
                          setShowLanguageFilter(false);
                        }}
                        className="form-radio h-4 w-4 text-blue-500 rounded border-gray-600 focus:ring-blue-500 bg-neutral-700"
                      />
                      <span className="ml-2 text-white">{lang}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Verdict Filter Dropdown */}
            <div className="relative" ref={verdictFilterRef}>
              <Button
                variant="secondary"
                onClick={() => setShowVerdictFilter(!showVerdictFilter)}
                className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-4 py-2 rounded-lg"
              >
                <History size={20} />
                <span>
                  Verdict: {selectedVerdict === "All" ? "All" : selectedVerdict}
                </span>
              </Button>
              {showVerdictFilter && (
                <div className="absolute z-10 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-2 text-white">
                  {uniqueVerdicts.map((verdict) => (
                    <label
                      key={verdict}
                      className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="verdict"
                        value={verdict}
                        checked={selectedVerdict === verdict}
                        onChange={() => {
                          setSelectedVerdict(verdict);
                          setShowVerdictFilter(false);
                        }}
                        className="form-radio h-4 w-4 text-green-500"
                      />
                      <span className="ml-2">{verdict}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative" ref={sortOptionsRef}>
              <Button
                variant="secondary"
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-4 py-2 rounded-lg"
              >
                <SortAsc size={20} />
                <span>
                  Sort By:{" "}
                  {sortBy === "submittedAt"
                    ? "Submitted On"
                    : sortBy === "problemTitle"
                    ? "Problem Title"
                    : sortBy === "language"
                    ? "Language"
                    : sortBy === "verdict"
                    ? "Verdict"
                    : sortBy === "runtime"
                    ? "Runtime"
                    : "Memory"}
                  ({sortOrder === "asc" ? "Asc" : "Desc"})
                </span>
              </Button>
              {showSortOptions && (
                <div className="absolute z-10 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-2 text-white">
                  <p className="font-semibold text-gray-300 px-2 pt-1 pb-2 border-b border-neutral-700">
                    Field
                  </p>
                  {/* Sort by Field */}
                  <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="submittedAt"
                      checked={sortBy === "submittedAt"}
                      onChange={() => handleSortChange("submittedAt")}
                      className="form-radio h-4 w-4 text-blue-500"
                    />
                    <span className="ml-2">Submitted On</span>
                  </label>
                  <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="problemTitle"
                      checked={sortBy === "problemTitle"}
                      onChange={() => handleSortChange("problemTitle")}
                      className="form-radio h-4 w-4 text-blue-500"
                    />
                    <span className="ml-2">Problem Title</span>
                  </label>
                  <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="language"
                      checked={sortBy === "language"}
                      onChange={() => handleSortChange("language")}
                      className="form-radio h-4 w-4 text-blue-500"
                    />
                    <span className="ml-2">Language</span>
                  </label>
                  <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="verdict"
                      checked={sortBy === "verdict"}
                      onChange={() => handleSortChange("verdict")}
                      className="form-radio h-4 w-4 text-blue-500"
                    />
                    <span className="ml-2">Verdict</span>
                  </label>
                  <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="runtime"
                      checked={sortBy === "runtime"}
                      onChange={() => handleSortChange("runtime")}
                      className="form-radio h-4 w-4 text-blue-500"
                    />
                    <span className="ml-2">Runtime</span>
                  </label>
                  <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="memory"
                      checked={sortBy === "memory"}
                      onChange={() => handleSortChange("memory")}
                      className="form-radio h-4 w-4 text-blue-500"
                    />
                    <span className="ml-2">Memory</span>
                  </label>

                  <p className="font-semibold text-gray-300 px-2 pt-3 pb-2 border-t border-neutral-700 mt-2">
                    Order
                  </p>
                  {/* Sort by Order */}
                  <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="asc"
                      checked={sortOrder === "asc"}
                      onChange={() => setSortOrder("asc")}
                      className="form-radio h-4 w-4 text-blue-500"
                    />
                    <span className="ml-2">Ascending</span>
                  </label>
                  <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="desc"
                      checked={sortOrder === "desc"}
                      onChange={() => setSortOrder("desc")}
                      className="form-radio h-4 w-4 text-blue-500"
                    />
                    <span className="ml-2">Descending</span>
                  </label>
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {(searchTerm ||
              selectedLanguage !== "All" ||
              selectedVerdict !== "All" ||
              sortBy !== "submittedAt" ||
              sortOrder !== "desc") && (
              <Button
                variant="tertiary"
                onClick={clearFilters}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                <XCircle size={20} />
                <span>Clear Filters</span>
              </Button>
            )}
          </div>

          {/* Display selected filters/tags/sort for user clarity */}
          <div className="flex flex-wrap items-center gap-2 text-gray-400 text-sm">
            {searchTerm && <span>Search: "{searchTerm}"</span>}
            {selectedLanguage !== "All" && (
              <span>Language: {selectedLanguage}</span>
            )}
            {selectedVerdict !== "All" && (
              <span>Verdict: {selectedVerdict}</span>
            )}
            <span>
              Sort By:{" "}
              {sortBy === "submittedAt"
                ? "Submitted On"
                : sortBy === "problemTitle"
                ? "Problem Title"
                : sortBy === "language"
                ? "Language"
                : sortBy === "verdict"
                ? "Verdict"
                : sortBy === "runtime"
                ? "Runtime"
                : "Memory"}{" "}
              ({sortOrder === "asc" ? "Asc" : "Desc"})
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-lg text-gray-400 mt-4">Loading submissions...</p>
          </div>
        ) : filteredAndSortedSubmissions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-400">
              No submissions found matching your criteria.
            </p>
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="mt-4 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="bg-neutral-900 rounded-lg shadow-xl overflow-hidden border border-neutral-700">
            <table className="min-w-full divide-y divide-neutral-700">
              <thead className="bg-neutral-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("submittedAt")}
                  >
                    #
                    {sortBy === "submittedAt" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("problemTitle")}
                  >
                    Problem
                    {sortBy === "problemTitle" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("language")}
                  >
                    Language
                    {sortBy === "language" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("verdict")}
                  >
                    Verdict
                    {sortBy === "verdict" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("runtime")}
                  >
                    Runtime (ms)
                    {sortBy === "runtime" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("memory")}
                  >
                    Memory (KB)
                    {sortBy === "memory" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("submittedAt")}
                  >
                    Submitted On
                    {sortBy === "submittedAt" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredAndSortedSubmissions.map((sub, index) => (
                  <motion.tr
                    key={sub._id}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
                    className="bg-neutral-900 transition-colors duration-200 cursor-pointer"
                    onClick={() => navigate(`/submissions/${sub._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:underline">
                      {/* Link to problem view page like in ProblemList */}
<Link to={sub.problem?.slug ? `/problems/${sub.problem.slug}` : "#"}>
                        {sub.problem?.title || "Deleted Problem"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {sub.language}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge
                        variant={getStatusBadgeVariant(sub.verdict)}
                        className={`${
                          getStatusBadgeVariant(sub.verdict) === "success"
                            ? "bg-green-500"
                            : getStatusBadgeVariant(sub.verdict) === "danger"
                            ? "bg-red-500"
                            : getStatusBadgeVariant(sub.verdict) === "warning"
                            ? "bg-yellow-500"
                            : getStatusBadgeVariant(sub.verdict) === "info"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        } text-white px-2 py-1 rounded-full text-xs`}
                      >
                        {sub.verdict}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {sub.runtime !== null && sub.runtime !== undefined
                        ? `${sub.runtime.toFixed(2)}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {sub.memory !== null && sub.memory !== undefined
                        ? `${sub.memory.toFixed(2)}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {/* No pagination for Submission History for now, as it's not in the requirements */}
            {/* If you want pagination similar to ProblemList, you'd add it here */}
          </div>
        )}
      </div>
    </>
  );
};

export default SubmissionHistory;
