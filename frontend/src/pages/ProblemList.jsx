import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge";


import { Search, SlidersHorizontal, Tags, SortAsc, ChevronLeft, ChevronRight, XCircle, FileText } from "lucide-react";


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

const ProblemList = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token= localStorage.getItem("token");


  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage, setProblemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);


  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [publishedFilter, setPublishedFilter] = useState('all'); 
  const [selectedTags, setSelectedTags] = useState([]);


  const [sortBy, setSortBy] = useState('problemNumber'); 
  const [sortOrder, setSortOrder] = useState('asc'); 


  const [message, setMessage] = useState('');


  const [showDifficultyFilter, setShowDifficultyFilter] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showPublishedFilter, setShowPublishedFilter] = useState(false);  


  const difficultyFilterRef = useRef(null);
  const tagFilterRef = useRef(null);
  const sortOptionsRef = useRef(null);
  const publishedFilterRef = useRef(null); 


  const difficultyOptions = ["Easy", "Medium", "Hard"];
  const publishedOptions = [
    { label: "All", value: "all" },
    { label: "Published", value: "published" },
    { label: "Draft", value: "draft" },
  ];

  const [availableTags, setAvailableTags] = useState([]);


  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        setIsAdmin(decodedToken.role === 'admin');
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []); 



  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage('');
  console.log("Current publishedFilter state:", publishedFilter); 

    try {

      const params = {
        page: currentPage,
        limit: problemsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }
      if (selectedDifficulties.length > 0) {
        params.difficulty = selectedDifficulties.join(',');
      }
      




      if (publishedFilter !== 'all') {
        params.isPublished = publishedFilter === 'published'; 
      }
        console.log("Params being sent to backend (frontend log):", params); 

      
      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',');
      }
      

      const response = await axios.get(`${API_BASE_URL}/api/problems`, {
              params: params,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

      
      setProblems(response.data.problems);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotalProblems(response.data.totalProblems);

    } catch (err) {
      console.error("Error fetching problems:", err);
      setError("Failed to fetch problems. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, problemsPerPage, debouncedSearchQuery, selectedDifficulties, publishedFilter, selectedTags, sortBy, sortOrder, isAdmin]); 


  const fetchAvailableTags = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/problems/tags`); 
      setAvailableTags(response.data);
    } catch (err) {
      console.error("Error fetching available tags:", err);

    }
  }, []);




  useEffect(() => {
    fetchProblems();
  }, [fetchProblems, isAdmin]); 



  useEffect(() => {
    fetchAvailableTags();
  }, [fetchAvailableTags]);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (difficultyFilterRef.current && !difficultyFilterRef.current.contains(event.target)) {
        setShowDifficultyFilter(false);
      }
      if (tagFilterRef.current && !tagFilterRef.current.contains(event.target)) {
        setShowTagFilter(false);
      }
      if (sortOptionsRef.current && !sortOptionsRef.current.contains(event.target)) {
        setShowSortOptions(false);
      }
      if (publishedFilterRef.current && !publishedFilterRef.current.contains(event.target)) {
        setShowPublishedFilter(false); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
    setCurrentPage(1); 
  };


  const handlePublishedFilterChange = (value) => {
    setPublishedFilter(value);
    setShowPublishedFilter(false); 
    setCurrentPage(1); 
  };

  const handleTagChange = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1); 
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setShowSortOptions(false); 
    setCurrentPage(1); 
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDifficulties([]);
    setPublishedFilter('all'); 
    setSelectedTags([]);
    setSortBy('problemNumber');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) {
      return;
    }
    setLoading(true);
    setError(null);
    setMessage('');
    try {

      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/problems/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage("Problem deleted successfully!");

      fetchProblems();
    } catch (err) {
      console.error("Error deleting problem:", err);
      setError(err.response?.data?.message || "Failed to delete problem.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-400">Problem List</h1>
        {/* Only show "Add New Problem" button if isAdmin */}
        {isAdmin && (
          <Link to="/problems/new">
            <Button
              variant="primary"
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-md text-white px-6 py-2 rounded-lg transition transform hover:scale-105"
            >
              Add New Problem
            </Button>
          </Link>
        )}
      </div>

      {message && (
        <div className="bg-green-500 text-white p-3 rounded-md mb-4 text-center">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
          {error}
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="mb-6 bg-neutral-900 p-5 rounded-lg shadow-xl border border-neutral-700">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Search Bar */}
          <div className="relative flex-grow min-w-[200px] max-w-sm">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {searchQuery && (
              <XCircle
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white"
                size={20}
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>

          {/* Difficulty Filter Dropdown */}
          <div className="relative" ref={difficultyFilterRef}>
            <Button
              variant="secondary"
              onClick={() => setShowDifficultyFilter(!showDifficultyFilter)}
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-4 py-2 rounded-lg"
            >
              <SlidersHorizontal size={20} />
              <span>Difficulty</span>
              {selectedDifficulties.length > 0 && (
                <Badge className="ml-1 bg-blue-600">{selectedDifficulties.length}</Badge>
              )}
            </Button>
            {showDifficultyFilter && (
              <div className="absolute z-10 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-2">
                {difficultyOptions.map(d => (
                  <label key={d} className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      value={d}
                      checked={selectedDifficulties.includes(d)}
                      onChange={() => handleDifficultyChange(d)}
                      className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-600 focus:ring-blue-500 bg-neutral-700"
                    />
                    <span className="ml-2 text-white">{d}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/*  Published Status Filter Dropdown (visible only to admins) */}
          {isAdmin && (
            <div className="relative" ref={publishedFilterRef}>
              <Button
                variant="secondary"
                onClick={() => setShowPublishedFilter(!showPublishedFilter)}
                className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-4 py-2 rounded-lg"
              >
                <FileText size={20} />
                <span>Status: {publishedOptions.find(o => o.value === publishedFilter)?.label}</span>
              </Button>
              {showPublishedFilter && (
                <div className="absolute z-10 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-2 text-white">
                  {publishedOptions.map(option => (
                    <label key={option.value} className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                      <input
                        type="radio"
                        name="publishedStatus"
                        value={option.value}
                        checked={publishedFilter === option.value}
                        onChange={() => handlePublishedFilterChange(option.value)}
                        className="form-radio h-4 w-4 text-blue-500"
                      />
                      <span className="ml-2">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags Filter Dropdown */}
          <div className="relative" ref={tagFilterRef}>
            <Button
              variant="secondary"
              onClick={() => setShowTagFilter(!showTagFilter)}
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-4 py-2 rounded-lg"
            >
              <Tags size={20} />
              <span>Tags</span>
              {selectedTags.length > 0 && (
                <Badge className="ml-1 bg-green-600">{selectedTags.length}</Badge>
              )}
            </Button>
            {showTagFilter && (
              <div className="absolute z-10 mt-2 w-48 max-h-60 overflow-y-auto bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-2">
                {availableTags.length === 0 ? (
                  <p className="text-gray-400 p-2">No tags available.</p>
                ) : (
                  availableTags.map(tag => (
                    <label key={tag} className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        value={tag}
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagChange(tag)}
                        className="form-checkbox h-4 w-4 text-purple-500 rounded border-gray-600 focus:ring-purple-500 bg-neutral-700"
                      />
                      <span className="ml-2 text-white">{tag}</span>
                    </label>
                  ))
                )}
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
                {sortBy === "problemNumber"
                  ? "Number"
                  : sortBy === "title"
                  ? "Title"
                  : sortBy === "difficulty"
                  ? "Difficulty"
                  : sortBy === "acceptanceRate"
                  ? "Acceptance Rate"
                  : sortBy}
                ({sortOrder === "asc" ? "Asc" : "Desc"})
              </span>
            </Button>
            {showSortOptions && (
              <div className="absolute z-10 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-2 text-white">
                <p className="font-semibold text-gray-300 px-2 pt-1 pb-2 border-b border-neutral-700">Field</p>
                {/* Sort by Field */}
                <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="sortBy"
                    value="problemNumber"
                    checked={sortBy === "problemNumber"}
                    onChange={() => handleSortChange("problemNumber", sortOrder)}
                    className="form-radio h-4 w-4 text-blue-500"
                  />
                  <span className="ml-2">Problem Number</span>
                </label>
                <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="sortBy"
                    value="title"
                    checked={sortBy === "title"}
                    onChange={() => handleSortChange("title", sortOrder)}
                    className="form-radio h-4 w-4 text-blue-500"
                  />
                  <span className="ml-2">Title</span>
                </label>
                <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="sortBy"
                    value="difficulty"
                    checked={sortBy === "difficulty"}
                    onChange={() => handleSortChange("difficulty", sortOrder)}
                    className="form-radio h-4 w-4 text-blue-500"
                  />
                  <span className="ml-2">Difficulty</span>
                </label>
                <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="sortBy"
                    value="acceptanceRate"
                    checked={sortBy === "acceptanceRate"}
                    onChange={() => handleSortChange("acceptanceRate", sortOrder)}
                    className="form-radio h-4 w-4 text-blue-500"
                  />
                  <span className="ml-2">Acceptance Rate</span>
                </label>

                <p className="font-semibold text-gray-300 px-2 pt-3 pb-2 border-t border-neutral-700 mt-2">Order</p>
                {/* Sort by Order */}
                <label className="flex items-center p-2 rounded-md hover:bg-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="sortOrder"
                    value="asc"
                    checked={sortOrder === "asc"}
                    onChange={() => handleSortChange(sortBy, "asc")}
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
                    onChange={() => handleSortChange(sortBy, "desc")}
                    className="form-radio h-4 w-4 text-blue-500"
                  />
                  <span className="ml-2">Descending</span>
                </label>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || selectedDifficulties.length > 0 || publishedFilter !== 'all' || selectedTags.length > 0 || sortBy !== 'problemNumber' || sortOrder !== 'asc') && (
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
          {searchQuery && <span>Search: "{searchQuery}"</span>}
          {selectedDifficulties.length > 0 && <span>Difficulty: {selectedDifficulties.join(', ')}</span>}
          {/* Display selected published filter */}
          {isAdmin && publishedFilter !== 'all' && <span>Status: {publishedOptions.find(o => o.value === publishedFilter)?.label}</span>}
          {selectedTags.length > 0 && <span>Tags: {selectedTags.join(', ')}</span>}
          <span>
            Sort By:{" "}
            {sortBy === "problemNumber"
              ? "Number"
              : sortBy === "title"
              ? "Title"
              : sortBy === "difficulty"
              ? "Difficulty"
              : sortBy === "acceptanceRate"
              ? "Acceptance Rate"
              : sortBy}{" "}
            ({sortOrder === "asc" ? "Asc" : "Desc"})
          </span>
        </div>

      </div>


      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-lg text-gray-400 mt-4">Loading problems...</p>
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">No problems found matching your criteria.</p>
          <Button
            variant="secondary"
            onClick={clearFilters}
            className="mt-4 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-lg shadow-xl overflow-hidden border border-neutral-700 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-700">
            <thead className="bg-neutral-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('problemNumber', sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  #
                  {sortBy === 'problemNumber' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('title', sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  Title
                  {sortBy === 'title' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('difficulty', sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  Difficulty
                  {sortBy === 'difficulty' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('acceptanceRate', sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  Acceptance Rate
                  {sortBy === 'acceptanceRate' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                {isAdmin && ( 
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                )}
                {isAdmin && ( 
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {problems.map((problem) => (
                <tr key={problem._id} className="hover:bg-neutral-800 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {problem.problemNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:underline">
                    {/* Link to problem view page always */}
                    <Link to={`/problems/${problem._id}`}>{problem.title}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge
                      className={`${
                        problem.difficulty === 'Easy'
                          ? 'bg-green-500'
                          : problem.difficulty === 'Medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      } text-white px-2 py-1 rounded-full text-xs`}
                    >
                      {problem.difficulty}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {typeof problem.acceptanceRate === 'number'
                      ? `${problem.acceptanceRate.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                  {isAdmin && ( 
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge
                        className={`${
                          problem.isPublished
                            ? 'bg-indigo-500' 
                            : 'bg-gray-500' 
                        } text-white px-2 py-1 rounded-full text-xs`}
                      >
                        {problem.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                  )}
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <Link to={`/problems/${problem._id}/edit`}>
                          <Button
                            variant="secondary"
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 text-sm"
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(problem._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
              </Button>
              <span className="text-lg text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemList;