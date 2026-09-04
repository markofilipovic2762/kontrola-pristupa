import { useEffect, useState } from "react";
import {
  deactivateMobile,
  deactivateNfc,
  getAktivniKorisnici,
  type AktivniKorisnik,
} from "./utils/api";
import { useNavigate } from "react-router-dom";
import { Smartphone } from "lucide-react";

import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

const UpravljanjePristupom = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState<AktivniKorisnik>();
  const [animate, setAnimate] = useState(false);
  const [korisnici, setKorisnici] = useState<AktivniKorisnik[]>();
  const [showError, setShowError] = useState<boolean>(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    getAktivniKorisnici()
      .then((res) => setKorisnici(res))
      .catch((err) => {
        console.log(err);
        alert("Neuspelo ucitavanje podataka!");
      });
  }, []);

  // Filtriranje korisnika
  const filteredKorisnici =
    korisnici?.filter((korisnik) => {
      const matchesSearch =
        korisnik.clan.IME.toLowerCase().includes(searchTerm.toLowerCase()) ||
        korisnik.mbr.includes(searchTerm) ||
        korisnik.clan.PREZIME.toLowerCase().includes(
          searchTerm.toLowerCase()
        ) ||
        korisnik.vrata == Number(searchTerm.toLowerCase());
      return matchesSearch;
    }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredKorisnici.length / rowsPerPage);
  const paginatedKorisnici = filteredKorisnici.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleRemoveAccess = (korisnik: AktivniKorisnik) => {
    setUserToRemove(korisnik);
    setShowConfirmModal(true);
  };

  const confirmRemoveAccess = () => {
    if (userToRemove && userToRemove.id_card) {
      deactivateNfc(userToRemove.id)
        .then((res) => {
          if (res) {
            Toast.fire({
              icon: "success",
              title: "Korisniku je uklonjen pristup nfc karticom",
            });
            getAktivniKorisnici().then((res) => setKorisnici(res));
            setTimeout(() => window.location.reload(), 3000);
          }
        })
        .catch((err) => {
          console.log(err);
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
        });
    }
    setShowConfirmModal(false);
    setUserToRemove(undefined);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 1000);
  };

  const confirmRemoveMobileAccess = () => {
    if (userToRemove && userToRemove.id_card) {
      deactivateMobile(userToRemove.id)
        .then((res) => {
          if (res) {
            getAktivniKorisnici().then((res) => setKorisnici(res));
            Toast.fire({
              icon: "success",
              title: "Korisniku je uklonjen mobilni pristup",
            });
            setTimeout(() => window.location.reload(), 3000);
          }
        })
        .catch((err) => {
          console.log(err);
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
        });
    }
    setShowConfirmModal(false);
    setUserToRemove(undefined);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 1000);
  };

  const cancelRemoveAccess = () => {
    setShowConfirmModal(false);
    setUserToRemove(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
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

      <div className="max-w-7xl mx-auto relative z-10">
        <button
          onClick={() => navigate("/")}
          className="absolute cursor-pointer top-2 z-50 px-5 py-3 bg-gradient-to-r from-green-500 to-violet-500 text-white rounded-full shadow-lg text-lg font-bold hover:scale-105 transition-all hover:bg-gray-600 hover:text-gray-100"
        >
          Nazad
        </button>
        {/* Header */}
        <div className="text-center mb-12">
          {/* <button
            onClick={handleBack}
            className="absolute cursor-pointer top-3 left-0 z-50 px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full shadow-lg text-lg font-bold hover:scale-105 transition-all"
          >
            Nazad
          </button> */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl mb-4">
            UPRAVLJANJE PRISTUPOM
          </h1>
          <p className="text-xl text-white/80 font-medium">
            Pregled i upravljanje korisnicima sa pristupom
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 mb-3">
              <label className="block text-white text-lg font-semibold mb-3">
                Pretraži korisnike
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white placeholder-purple-200 rounded-2xl focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-lg"
                placeholder="Ime, MBR, lokacija, zgrada, vrata..."
              />
            </div>

            {/* Stats */}
            <div className="mt-6 flex justify-center items-center">
              <div className="bg-white/10 rounded-2xl px-6 py-3 border border-white/20">
                <span className="text-white text-lg font-semibold">
                  Ukupno korisnika:{" "}
                  <span className="text-cyan-300">
                    {filteredKorisnici?.length}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className={`bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden transition-all duration-500 ${
              animate ? "scale-105" : "scale-100"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600/50 to-blue-600/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-white text-lg font-bold">
                      IME
                    </th>
                    <th className="px-6 py-4 text-left text-white text-lg font-bold">
                      PREZIME
                    </th>
                    <th className="px-6 py-4 text-left text-white text-lg font-bold">
                      MBR
                    </th>
                    <th className="px-6 py-4 text-left text-white text-lg font-bold">
                      VRATA
                    </th>
                    <th className="px-6 py-4 text-center text-white text-lg font-bold">
                      AKCIJA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedKorisnici.map((korisnik, index) => (
                    <tr
                      key={korisnik.id}
                      className={`border-b border-white/10 hover:bg-white/5 transition-all duration-300 ${
                        index % 2 === 0 ? "bg-white/5" : "bg-transparent"
                      }`}
                    >
                      <td className="px-6 py-4 text-white font-semibold text-lg">
                        {korisnik.clan.IME}
                      </td>
                      <td className="px-6 py-4 text-gray-200 font-semibold text-lg">
                        {korisnik.clan.PREZIME}
                      </td>
                      <td className="px-6 py-4 text-cyan-300 font-semibold text-lg">
                        {korisnik.clan.MATICNI_BROJ}
                      </td>
                      <td className="px-6 py-4 text-green-300 font-semibold text-lg">
                        {korisnik.vrata}
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleRemoveAccess(korisnik)}
                            className="bg-gradient-to-r cursor-pointer from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-4 focus:ring-red-300"
                          >
                            UKLONI PRISTUP
                          </button>
                        </div>
                        {korisnik.is_mobile && (
                          <Smartphone className="absolute right-6 top-1/2 transform -translate-y-1/2 text-yellow-300 w-7 h-7 animate-pulse" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                <span className="text-white">Redova po stranici:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1"
                >
                  {[5, 10, 20, 50].map((num) => (
                    <option
                      key={num}
                      value={num}
                      className="bg-gray-100 text-gray-700"
                    >
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white disabled:opacity-50"
                >
                  &lt;
                </button>
                <span className="text-white">
                  Stranica {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* Empty state */}
            {filteredKorisnici.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Nema rezultata
                </h3>
                <p className="text-gray-300 text-lg">
                  Pokušajte sa drugim kriterijumima pretrage
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-white to-red-50 rounded-3xl shadow-2xl p-10 w-96 mx-4 transform transition-all duration-300 scale-110">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Potvrdi uklanjanje pristupa za:
                </h2>
                {userToRemove && (
                  <div className="bg-red-50 rounded-2xl p-4 border-2 border-red-200">
                    <p className="font-bold text-red-800 text-xl">
                      {userToRemove.clan.IME + " " + userToRemove.clan.PREZIME}
                    </p>
                    <p className="text-red-600 text-xl">
                      Vrata: {userToRemove.vrata}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={cancelRemoveAccess}
                  className="flex-1 cursor-pointer px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg text-lg font-semibold"
                >
                  Otkaži
                </button>
                <button
                  onClick={confirmRemoveAccess}
                  className="flex-1 cursor-pointer px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg text-lg font-semibold"
                >
                  Ukloni
                </button>
                {userToRemove?.is_mobile && (
                  <button
                    onClick={confirmRemoveMobileAccess}
                    className="flex-1 cursor-pointer px-4 py-4 border-2 border-blue-400 bg-gradient-to-r from-red-500 to-pink-400 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg text-md font-semibold"
                  >
                    Ukloni mobilni
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showError && (
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
                Neuspešno ukljanjanje pristupa
              </h2>
              <p className="text-xl text-gray-700 font-semibold">
                Pokušajte ponovo ili proverite podatke
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpravljanjePristupom;
