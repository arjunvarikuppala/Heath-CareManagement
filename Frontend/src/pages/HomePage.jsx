function Home() {

  return (

    <div className="relative overflow-hidden bg-[#050816] text-white">

      {/* BACKGROUND LIGHTS */}

      <div className="absolute top-0 left-0 w-[280px] h-[280px] sm:w-[600px] sm:h-[600px] bg-cyan-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="absolute top-[30%] right-0 w-[260px] h-[260px] sm:w-[500px] sm:h-[500px] bg-blue-500/20 rounded-full blur-3xl translate-x-1/2" />

      <div className="absolute bottom-0 left-[20%] w-[240px] h-[240px] sm:w-[450px] sm:h-[450px] bg-sky-500/10 rounded-full blur-3xl translate-y-1/2" />

      {/* HERO SECTION */}

      <section
        id="home"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-28"
      >

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT */}

          <div>

            <span className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-5 py-2 rounded-full text-sm font-semibold backdrop-blur-md">

              FUTURE OF HEALTHCARE

            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mt-8 lg:mt-10">

              Intelligent
              <span className="text-cyan-400">
                {" "}Hospital
              </span>

              <br />

              Management System

            </h1>

            <p className="text-gray-400 text-base sm:text-xl leading-relaxed mt-6 lg:mt-10 max-w-2xl">

              CareSync transforms hospital operations
              through AI-powered healthcare workflows,
              modern patient experiences, and intelligent
              medical management systems.

            </p>

            {/* BUTTONS */}

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 lg:mt-12">

              <button className="bg-cyan-400 text-black px-6 sm:px-8 py-4 rounded-2xl text-base sm:text-lg font-bold hover:scale-105 transition shadow-2xl shadow-cyan-500/30">

                Get Started

              </button>

              <button className="border border-white/10 bg-white/5 backdrop-blur-md px-6 sm:px-8 py-4 rounded-2xl text-base sm:text-lg font-semibold hover:bg-white/10 transition">

                Explore Platform

              </button>

            </div>

            {/* STATS */}

            <div
              id="branches"
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-14 mt-10 lg:mt-16"
            >

              <div>

                <h2 className="text-4xl sm:text-5xl font-black text-cyan-400">

                  50+

                </h2>

                <p className="text-gray-400 mt-3">

                  Hospital Branches

                </p>

              </div>

              <div>

                <h2 className="text-4xl sm:text-5xl font-black text-cyan-400">

                  10K+

                </h2>

                <p className="text-gray-400 mt-3">

                  Patients Served

                </p>

              </div>

              <div>

                <h2 className="text-4xl sm:text-5xl font-black text-cyan-400">

                  500+

                </h2>

                <p className="text-gray-400 mt-3">

                  Specialist Doctors

                </p>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative">

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl">

              <img

                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop"

                alt="Healthcare"

                className="rounded-[2rem] h-80 md:h-[520px] lg:h-[600px] w-full object-cover"

              />

            </div>

            {/* FLOATING CARD */}

            <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-10 sm:-left-10 bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 w-full sm:w-72 shadow-2xl">

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-2xl bg-cyan-400 flex items-center justify-center text-3xl">

                  🚑

                </div>

                <div>

                  <h3 className="text-2xl font-bold">

                    24/7 Care

                  </h3>

                  <p className="text-gray-400 mt-1">

                    Emergency Support

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* WHY CHOOSE US */}

      <section
        id="services"
        className="relative z-10 py-16 lg:py-28"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

          {/* HEADING */}

          <div className="text-center">

            <span className="text-cyan-400 font-semibold uppercase tracking-widest">

              Why Choose CareSync

            </span>

            <h2 className="text-3xl sm:text-5xl font-bold mt-6">

              Delivering Smarter
              Healthcare Experiences

            </h2>

            <p className="text-gray-400 text-base sm:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">

              CareSync combines modern technology,
              expert healthcare professionals,
              and intelligent medical workflows
              to deliver exceptional patient care.

            </p>

          </div>

          {/* CARDS */}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-12 lg:mt-20">

            {/* CARD */}

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:-translate-y-2 transition duration-300">

              <div className="text-5xl">

                🩺

              </div>

              <h3 className="text-2xl font-bold mt-6">

                Expert Doctors

              </h3>

              <p className="text-gray-400 mt-4 leading-relaxed">

                Highly experienced specialists
                delivering world-class healthcare.

              </p>

            </div>

            {/* CARD */}

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:-translate-y-2 transition duration-300">

              <div className="text-5xl">

                🚑

              </div>

              <h3 className="text-2xl font-bold mt-6">

                Emergency Care

              </h3>

              <p className="text-gray-400 mt-4 leading-relaxed">

                Advanced emergency response
                and critical care facilities.

              </p>

            </div>

            {/* CARD */}

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:-translate-y-2 transition duration-300">

              <div className="text-5xl">

                💻

              </div>

              <h3 className="text-2xl font-bold mt-6">

                Smart Appointments

              </h3>

              <p className="text-gray-400 mt-4 leading-relaxed">

                Digital appointment booking
                and healthcare management.

              </p>

            </div>

            {/* CARD */}

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:-translate-y-2 transition duration-300">

              <div className="text-5xl">

                🏥

              </div>

              <h3 className="text-2xl font-bold mt-6">

                Modern Facilities

              </h3>

              <p className="text-gray-400 mt-4 leading-relaxed">

                State-of-the-art hospital
                infrastructure and technology.

              </p>

            </div>

          </div>

        </div>

      </section>

      {/* SPECIALTIES SECTION */}

      <section
        id="doctors"
        className="relative z-10 py-16 lg:py-28"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

          {/* HEADING */}

          <div className="text-center">

            <span className="text-cyan-400 font-semibold uppercase tracking-widest">

              Our Specialties

            </span>

            <h2 className="text-3xl sm:text-5xl font-bold mt-6">

              Advanced Medical
              Specialties

            </h2>

            <p className="text-gray-400 text-base sm:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">

              CareSync offers advanced healthcare services
              with expert doctors and cutting-edge medical technologies.

            </p>

          </div>

          {/* SPECIALTY CARDS */}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 mt-12 lg:mt-20">

            {/* CARD */}

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:-translate-y-2 transition duration-300">

              <img

                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop"

                alt="Cardiology"

                className="h-64 w-full object-cover"

              />

              <div className="p-8">

                <h3 className="text-2xl sm:text-3xl font-bold">

                  Cardiology

                </h3>

                <p className="text-gray-400 mt-4 leading-relaxed">

                  Advanced heart care services
                  with experienced cardiologists.

                </p>

              </div>

            </div>

            {/* CARD */}

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:-translate-y-2 transition duration-300">

              <img

                src="https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop"

                alt="Neurology"

                className="h-64 w-full object-cover"

              />

              <div className="p-8">

                <h3 className="text-2xl sm:text-3xl font-bold">

                  Neurology

                </h3>

                <p className="text-gray-400 mt-4 leading-relaxed">

                  Specialized neurological treatments
                  and advanced brain care.

                </p>

              </div>

            </div>

            {/* CARD */}

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:-translate-y-2 transition duration-300">

              <img

                src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop"

                alt="Pediatrics"

                className="h-64 w-full object-cover"

              />

              <div className="p-8">

                <h3 className="text-2xl sm:text-3xl font-bold">

                  Pediatrics

                </h3>

                <p className="text-gray-400 mt-4 leading-relaxed">

                  Compassionate child healthcare
                  and wellness services.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer
        id="contact"
        className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-xl pt-16 lg:pt-24 pb-10"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 border-b border-white/10 pb-16">

            {/* BRAND */}

            <div>

              <h1 className="text-4xl font-black text-cyan-400">

                CareSync

              </h1>

              <p className="text-gray-400 mt-6 leading-relaxed">

                Intelligent healthcare management
                platform delivering modern hospital experiences.

              </p>

            </div>

            {/* LINKS */}

            <div>

              <h2 className="text-xl font-semibold mb-6">

                Quick Links

              </h2>

              <div className="flex flex-col gap-4 text-gray-400">

                <a href="#" className="hover:text-cyan-400 transition">

                  Home

                </a>

                <a href="#" className="hover:text-cyan-400 transition">

                  About

                </a>

                <a href="#" className="hover:text-cyan-400 transition">

                  Services

                </a>

                <a href="#" className="hover:text-cyan-400 transition">

                  Contact

                </a>

              </div>

            </div>

            {/* SPECIALTIES */}

            <div>

              <h2 className="text-xl font-semibold mb-6">

                Specialties

              </h2>

              <div className="flex flex-col gap-4 text-gray-400">

                <p>Cardiology</p>
                <p>Neurology</p>
                <p>Pediatrics</p>
                <p>Orthopedics</p>

              </div>

            </div>

            {/* CONTACT */}

            <div>

              <h2 className="text-xl font-semibold mb-6">

                Contact

              </h2>

              <div className="flex flex-col gap-4 text-gray-400">

                <p>support@caresync.com</p>
                <p>+91 98765 43210</p>
                <p>Hyderabad, India</p>

              </div>

            </div>

          </div>

          {/* BOTTOM */}

          <div className="flex flex-col lg:flex-row items-center justify-between pt-8 gap-6">

            <p className="text-gray-500 text-sm">

              © 2026 CareSync. All rights reserved.

            </p>

            <div className="flex gap-5 text-2xl">

              <span className="cursor-pointer hover:text-cyan-400 transition">

                🌐

              </span>

              <span className="cursor-pointer hover:text-cyan-400 transition">

                📘

              </span>

              <span className="cursor-pointer hover:text-cyan-400 transition">

                📸

              </span>

              <span className="cursor-pointer hover:text-cyan-400 transition">

                💼

              </span>

            </div>

          </div>

        </div>

      </footer>

    </div>

  );

}

export default Home;
