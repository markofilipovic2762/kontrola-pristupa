import { useState, useEffect } from "react";
import {
  getMbr,
  getLokacije,
  getZgrade,
  getVrata,
  postNfc,
  type Lokacija,
  type Zgrada,
  type Vrata,
  type MbrResponse,
  logout,
  getZahteviZaPristup,
} from "./utils/api";
import { useNavigate } from "react-router-dom";
import useAuth from "./utils/useAuth";

const App = () => {
  useAuth()
  const [currentStep, setCurrentStep] = useState(0);
  const [mbr, setMbr] = useState("");
  const [selectedLokacija, setSelectedLokacija] = useState("");
  const [selectedZgrada, setSelectedZgrada] = useState("");
  const [selectedVrata, setSelectedVrata] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [kartica, setKartica] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [animate] = useState(false); // Remove unused setter
  const [showMbrNotFound, setShowMbrNotFound] = useState(false);
  const [showUpisError, setShowUpisError] = useState(false);

  // API state
  const [lokacije, setLokacije] = useState<Lokacija[]>([]);
  const [zgrade, setZgrade] = useState<Zgrada[]>([]);
  const [vrata, setVrata] = useState<Vrata[]>([]);
  const [mbrData, setMbrData] = useState<MbrResponse | undefined>(undefined);
  const [statusMsg, setStatusMsg] = useState("");
  const [brojZahteva, setBrojZahteva] = useState(0);

  const stepTitles = [
    "Unesite MBR",
    "Odaberite Lokaciju",
    "Odaberite Zgradu",
    "Odaberite Vrata",
  ];

  const navigate = useNavigate();

  useEffect(() => {
    getLokacije()
      .then((res) => setLokacije(res))
      .catch(() => setLokacije([]));
  }, []);

  useEffect(() => {
    getZahteviZaPristup().then((res) => setBrojZahteva(res.length));
  }, []);
      

  useEffect(() => {
    if (mbr.trim() && currentStep === 0 && mbr.length === 5) {
      getMbr(mbr)
        .then((res) => {
          setMbrData(res);
          setTimeout(() => setCurrentStep(1), 500);
        })
        .catch((err) => {
          setShowMbrNotFound(true);
          console.log(err);
          setTimeout(() => setShowMbrNotFound(false), 3000);
        });
    } else {
      setCurrentStep(0);
      resetAll();
    }
  }, [mbr]);

  useEffect(() => {
    if (selectedLokacija) {
      getZgrade(Number(selectedLokacija))
        .then((res) => setZgrade(res))
        .catch(() => setZgrade([]));
    } else {
      setZgrade([]);
    }
  }, [selectedLokacija]);

  useEffect(() => {
    if (selectedZgrada) {
      getVrata(Number(selectedZgrada))
        .then((res) => setVrata(res))
        .catch(() => setVrata([]));
    } else {
      setVrata([]);
    }
  }, [selectedZgrada]);

  const handleMbrChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMbr(value);
  };

  const handleLokacijaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLokacija(e.target.value);
    setSelectedZgrada("");
    setSelectedVrata("");
    if (e.target.value) {
      setTimeout(() => setCurrentStep(2), 500);
    }
  };

  const handleZgradaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedZgrada(e.target.value);
    setSelectedVrata("");
    if (e.target.value) {
      setTimeout(() => setCurrentStep(3), 500);
    }
  };

  const handleVrataChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVrata(e.target.value);
    setShowModal(true);
    if (e.target.value) {
      setTimeout(() => setShowModal(true), 500);
    }
  };

  const resetAll = () => {
    setSelectedLokacija("");
    setSelectedZgrada("");
    setSelectedVrata("");
  };

  const handleKarticaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!kartica.trim() || !mbr || !selectedVrata) return;
    setStatusMsg("");
    try {
      await postNfc({ mbr, id_card: kartica, vrata: Number(selectedVrata) });
      setShowModal(false);
      setShowSuccess(true);
      setKartica("");
      setStatusMsg("Pristup je odobren!");
      setTimeout(() => {
        setShowSuccess(false);
        setMbr("");
        resetAll();
        setKartica("");
        setCurrentStep(0);
        setStatusMsg("")
      }, 3000);
    } catch (err) {
      setShowUpisError(true);
      setTimeout(() => setShowUpisError(false), 3000);
      console.log(err)
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setKartica("");
  };

  const renderCurrentStep = () => {
    const stepClasses = `transform transition-all duration-500 ${
      animate ? "scale-110 opacity-70" : "scale-100 opacity-100"
    }`;

    switch (currentStep) {
      case 0:
        return (
          <div className={`${stepClasses} text-center`}>
            <h2 className="text-5xl font-bold text-white mb-8 drop-shadow-lg">
              {stepTitles[0]}
            </h2>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl border border-white/30">
              <input
                type="text"
                value={mbr}
                onChange={handleMbrChange}
                className="w-full text-center px-6 py-4 text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white placeholder-purple-200 rounded-2xl focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-lg"
                placeholder="Unesite MBR..."
                autoFocus
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className={`${stepClasses} text-center`}>
            <h2 className="text-5xl font-bold text-white mb-8 drop-shadow-lg">
              {stepTitles[1]}
            </h2>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl border border-white/30">
              <div className="relative">
                <select
                  value={selectedLokacija}
                  onChange={handleLokacijaChange}
                  className="w-full px-6 py-4 text-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-lg appearance-none pr-12"
                >
                  <option value="" className="text-gray-800 bg-white">
                    Odaberite lokaciju...
                  </option>
                  {lokacije.map((lok) => (
                    <option
                      key={lok.id}
                      value={lok.id}
                      className="text-gray-800 bg-white"
                    >
                      {lok.vrednost}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <svg
                    className="w-8 h-8 text-cyan-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={`${stepClasses} text-center`}>
            <h2 className="text-5xl font-bold text-white mb-8 drop-shadow-lg">
              {stepTitles[2]}
            </h2>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl border border-white/30">
              <select
                value={selectedZgrada}
                onChange={handleZgradaChange}
                className="w-full px-6 py-4 text-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-lg"
              >
                <option value="">Odaberite zgradu...</option>
                {zgrade?.map((zgr) => (
                  <option key={zgr.id} value={zgr.id} className="text-gray-800">
                    {zgr.vrednost}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={`${stepClasses} text-center`}>
            <h2 className="text-5xl font-bold text-white mb-8 drop-shadow-lg">
              {stepTitles[3]}
            </h2>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl border border-white/30">
              <select
                value={selectedVrata}
                onChange={handleVrataChange}
                className="w-full px-6 py-4 text-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-lg"
              >
                <option value="">Odaberite vrata...</option>
                {vrata?.map((spr) => (
                  <option key={spr.id} value={spr.id} className="text-gray-800">
                    {spr.vrednost}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Centered tabs for navigation */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="inline-flex items-center rounded-2xl bg-white/10 border border-white/20 text-2xl">
          <button
            onClick={() => navigate("/upravljanjepristupom")}
            className="px-6 py-2 cursor-pointer hover:bg-red-300 hover:text-gray-600 rounded-l-2xl text-white font-bold transition-colors"
          >
            Upravljanje pristupom
          </button>
          <span className="text-gray-100">|</span>
          <button
            onClick={() => navigate("/odobravanje")}
            className="px-6 py-2 cursor-pointer rounded-r-2xl text-white font-bold hover:bg-green-300 hover:text-gray-600 transition-colors"
          >
            Odobravanje pristupa <span className="bg-red-600 text-white text-sm font-semibold px-2 py-1 rounded-full">{brojZahteva}</span>
          </button>
        </div>
      </div>

      {/* Welcome text moved below tabs to avoid overlap */}
      <h1 className="absolute cursor-default text-2xl top-8 right-35 z-50 px-6 py-3 text-gray-100 font-serif">
        Dobrodošli, {localStorage.getItem("ime/kontrolapristupa")}
      </h1>

      <button
        onClick={() => logout()}
        className="absolute cursor-pointer top-8 right-8 z-50 px-6 py-3 bg-gradient-to-r from-green-500 to-violet-500 text-white rounded-full shadow-lg text-lg font-bold hover:scale-105 transition-all"
      >
        Odjavi se
      </button>

      <div className="z-50 flex items-start">
        <img src="logo4s.png" alt="Logo" className="w-[400px] h-[200px]" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center space-x-4 mt-8">
            {[0, 1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  step <= currentStep
                    ? "bg-gradient-to-r from-pink-400 to-violet-400 shadow-lg"
                    : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Step */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">{renderCurrentStep()}</div>
        </div>

        {/* Previous selections display */}
        {currentStep > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex flex-wrap gap-4 text-white text-lg">
                {mbr && (
                  <span className="bg-purple-500/50 px-4 py-2 rounded-full">
                    {mbr} {mbrData?.puno_ime}
                  </span>
                )}
                {selectedLokacija && (
                  <span className="bg-blue-500/50 px-4 py-2 rounded-full">
                    Lokacija:{" "}
                    {
                      lokacije.find((l) => l.id === Number(selectedLokacija))
                        ?.vrednost
                    }
                  </span>
                )}
                {selectedZgrada && (
                  <span className="bg-green-500/50 px-4 py-2 rounded-full">
                    Zgrada:{" "}
                    {
                      zgrade.find((z) => z.id === Number(selectedZgrada))
                        ?.vrednost
                    }
                  </span>
                )}
                {selectedVrata && (
                  <span className="bg-orange-500/50 px-4 py-2 rounded-full">
                    Vrata:{" "}
                    {
                      vrata?.find((s) => s.id === Number(selectedVrata))
                        ?.vrednost
                    }
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal za unos kartice */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-10 w-96 mx-4 transform transition-all duration-300 scale-110">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Unesi Karticu
              </h2>
            </div>
            <form onSubmit={handleKarticaSubmit}>
              <div className="mb-8">
                <input
                  type="text"
                  value={kartica}
                  onChange={(e) => setKartica(e.target.value)}
                  className="w-full px-6 py-4 text-xl bg-gradient-to-r from-green-400 to-blue-500 text-white placeholder-green-100 rounded-2xl focus:ring-4 focus:ring-green-300 outline-none transition-all shadow-lg"
                  placeholder="Broj kartice..."
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg text-lg font-semibold"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={!kartica.trim()}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg text-lg font-semibold"
                >
                  Potvrdi
                </button>
              </div>
              {statusMsg && (
                <div className="mt-4 text-lg text-center text-red-500">
                  {statusMsg}
                </div>
              )}
              {mbrData && (
                <div className="mt-4 text-lg text-center text-green-600">
                  <div>Ime: {mbrData.ime}</div>
                  <div>Prezime: {mbrData.prezime}</div>
                  <div>Matični broj: {mbrData.maticni_broj}</div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-3xl shadow-2xl p-12 w-96 mx-4 text-center transform transition-all duration-500 scale-110">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              USPEŠNO!
            </h2>
            <p className="text-2xl text-gray-700 font-semibold">
              Pristup je odobren
            </p>
          </div>
        </div>
      )}

      {/* MBR Not Found Message */}
      {showMbrNotFound && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-100 to-pink-50 rounded-3xl shadow-2xl p-12 w-96 mx-4 text-center transform transition-all duration-500 scale-110">
            <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
              MBR ne postoji!
            </h2>
            <p className="text-xl text-gray-700 font-semibold">
              Molimo proverite unos
            </p>
          </div>
        </div>
      )}

      {/* Card Registration Error Message */}
      {showUpisError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-100 to-pink-50 rounded-3xl shadow-2xl p-12 w-96 mx-4 text-center transform transition-all duration-500 scale-110">
            <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Neuspešan upis kartice!
            </h2>
            <p className="text-xl text-gray-700 font-semibold">
              Pokušajte ponovo ili proverite podatke
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
