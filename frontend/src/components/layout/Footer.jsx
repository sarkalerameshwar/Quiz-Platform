import { FaLinkedin, FaEnvelope, FaCode, FaHeadset, FaUserTie } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
          {/* Brand / About */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <FaCode className="text-indigo-500 mr-2" />
              Quiz<span className="text-indigo-500">Platform</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Empowering learners through interactive quizzes, engaging
              challenges, and smart assessments. Learn, practice, and grow with
              our comprehensive quiz platform built with modern technologies.
            </p>
          </div>

          {/* Contact / Social */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaHeadset className="mr-2 text-indigo-400" />
              Contact Us
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <a
              href="mailto:rameshwarsarkale21@gmail.com"
              className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors text-sm mb-4"
            >
              <FaEnvelope className="w-4 h-4 mr-2" />
              rameshwarsarkale21@gmail.com
            </a>
          </div>

          {/* Developer Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaUserTie className="mr-2 text-indigo-400" />
              Developer
            </h3>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">
                Full Stack Developer specializing in MERN stack applications
              </p>
              <div className="flex items-center text-sm text-gray-400">
                <FaCode className="text-indigo-400 mr-2" />
                <span>Rameshwar Sarkale</span>
              </div>
              <div className="flex flex-col space-y-2">
                <a
                  href="https://www.linkedin.com/in/rameshwarsarkale"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                >
                  <FaLinkedin className="w-4 h-4 mr-2" />
                  LinkedIn Profile
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Quiz Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
