import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();


  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, 
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-950 text-gray-100">
      {/* Navigation */}
      <nav className="px-6 py-5 flex justify-between items-center relative z-10 container mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-lg">OJ</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            CodeSlayer
          </h1>
        </div>
        <div>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 text-blue-300 font-semibold hover:text-blue-100 hover:bg-gray-800 rounded-lg transition-all duration-300 mr-2"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-xl transform hover:scale-105"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute -top-16 left-[calc(50%-13rem)] -z-10 transform-gpu blur-3xl sm:left-[calc(50%-36rem)] sm:top-[-30rem]"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.2%, 17.2% 95.7%, 36.3% 76.7%, 61.6% 97.5%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="container mx-auto px-6 py-20 md:py-32 text-center relative z-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
              Master Your Code with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                CodeSlayer
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Solve algorithmic challenges, test your solutions in real-time, and{" "}
              <span className="font-semibold text-white">
                sharpen your programming skills
              </span>{" "}
              on our advanced online judge platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl shadow-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Coding Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/problems")}
                className="px-10 py-4 border-2 border-blue-400 text-blue-300 font-bold rounded-xl hover:bg-blue-900/20 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                Browse Problems
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

    

      {/* Features Section */}
      <div className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-4xl md:text-5xl font-extrabold text-center mb-6 leading-tight"
          >
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              CodeSlayer
            </span>
            ?
          </motion.h2>
          <p className="text-lg md:text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Our platform provides a comprehensive and engaging environment to
            elevate your coding proficiency.
          </p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              variants={itemVariants}
              className="bg-gray-800/60 p-10 rounded-3xl shadow-xl border border-gray-700 relative overflow-hidden group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-700 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mr-5 shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  Real-time Code Execution
                </h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Run and test your code against various test cases instantly with
                our lightning-fast compiler.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              className="bg-gray-800/60 p-10 rounded-3xl shadow-xl border border-gray-700 relative overflow-hidden group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-700 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mr-5 shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 00-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  Vast Problem Library
                </h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Access a growing collection of problems, from easy to hard, to
                master various algorithms.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              className="bg-gray-800/60 p-10 rounded-3xl shadow-xl border border-gray-700 relative overflow-hidden group hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-green-700 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mr-5 shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  Detailed Progress Tracking
                </h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Monitor your submissions, track your ranking, and visualize your
                skill development over time.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-900/80 backdrop-blur-sm relative z-0">
        <div
          className="absolute bottom-[-10rem] right-[calc(50%-13rem)] -z-10 transform-gpu blur-3xl sm:right-[calc(50%-36rem)] sm:bottom-[-20rem]"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.2%, 17.2% 95.7%, 36.3% 76.7%, 61.6% 97.5%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
              Ready to Elevate Your Coding Game?
            </h2>
            <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-3xl mx-auto">
              Join our thriving community and start your journey towards coding
              mastery today.
            </p>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-12 py-5 bg-white text-blue-800 font-extrabold text-lg rounded-xl shadow-2xl hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started for Free
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 bg-gray-950 text-gray-500 text-center border-t border-gray-800">
        <div className="container mx-auto px-6">
          <p className="mb-4">
            © {new Date().getFullYear()} CodeSlayer. All rights reserved.
          </p>
          <div className="flex justify-center gap-8 text-gray-400">
            <a href="#" className="hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}