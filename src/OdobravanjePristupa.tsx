import React, { useEffect, useState } from "react";
import { getZahteviZaPristup, promeniStatus } from "./utils/api";
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

type PendingUser = {
  id: number;
  ime: string;
  prezime: string;
  pogon?: string;
  sektor?: string;
  mbr?: string;
  id_android: string;
  status?: string;
  datum?: string;
};

const OdobravanjePristupa: React.FC = () => {
  const [users, setUsers] = useState<PendingUser[]>([]);

  const setUserStatus = (id: number, status: "approved" | "rejected") => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  };

  // Confirmation modal state
  const [pendingAction, setPendingAction] = useState<{
    id: number;
    type: "approve" | "reject";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApprove = (id: number) => {
    setPendingAction({ id, type: "approve" });
  };

  const handleReject = (id: number) => {
    setPendingAction({ id, type: "reject" });
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    const { id, type } = pendingAction;
    setLoading(true);
    try {
      await promeniStatus(id, type === "approve" ? "A" : "N");
      setUserStatus(id, type === "approve" ? "approved" : "rejected");
      setPendingAction(null);
      Toast.fire({
        icon: "success",
        title: type === "approve" ? "Korisnik odobren" : "Korisnik odbijen",
      });
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      console.error(err);
      Toast.fire({
        icon: "error",
        title: "Greska pri odobravanju ili odbijanja zahteva!",
      });
      //setToast("Greška pri potvrdi akcije");
      //setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getZahteviZaPristup();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const hasUsers = users && users.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-5xl font-bold leading-relaxed bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200 mb-6">
          Odobravanje pristupa
        </h1>

        {hasUsers ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600/50 to-blue-600/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-white font-bold">
                      Ime
                    </th>
                    <th className="px-6 py-3 text-left text-white font-bold">
                      Prezime
                    </th>
                    <th className="px-6 py-3 text-left text-white font-bold">
                      Matični broj
                    </th>
                    <th className="px-6 py-3 text-left text-white font-bold">
                      Pogon
                    </th>
                    <th className="px-6 py-3 text-left text-white font-bold">
                      Sektor
                    </th>
                    <th className="px-6 py-3 text-left text-white font-bold">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-center text-white font-bold">
                      Akcija
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={`border-b border-white/10 hover:bg-white/5 transition-all duration-200 ${
                        idx % 2 === 0 ? "bg-white/5" : "bg-transparent"
                      }`}
                    >
                      <td className="px-6 py-4 text-white font-semibold">
                        {u.ime}
                      </td>
                      <td className="px-6 py-4 text-gray-200 font-semibold">
                        {u.prezime}
                      </td>
                      <td className="px-6 py-4 text-cyan-300 font-semibold">
                        {u.mbr}
                      </td>
                      <td className="px-6 py-4 text-green-300 font-semibold">
                        {u.pogon}
                      </td>
                      <td className="px-6 py-4 text-green-300 font-semibold">
                        {u.sektor}
                      </td>
                        <td className="px-6 py-4 text-green-300 font-semibold">
                        {u.datum
                          ? new Date(u.datum).toLocaleDateString("sr")
                          : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                        {u.status === "P" ? (
                          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/50 rounded-lg px-4 py-2">
                          <p className="text-yellow-300 font-semibold text-sm">
                            Čeka na potvrdu korisnika
                          </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleApprove(u.id)}
                            //disabled={u.status !== "pending"}
                              className="px-4 py-2 hover:brightness-75 cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold disabled:opacity-50"
                            >
                              ODOBRI
                            </button>
                            <button
                              onClick={() => handleReject(u.id)}
                              //disabled={u.status !== "pending"}
                              className="px-4 py-2 hover:brightness-75 cursor-pointer rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold disabled:opacity-50"
                            >
                              ODBIJ
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg">
              <h1 className="text-2xl text-center sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200 mb-2">
                Nema novih zahteva!
              </h1>
              <p className="text-md text-center text-white/80">
                Trenutno nema korisnika koji čekaju odobrenje.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {pendingAction &&
        (() => {
          const user = users.find((u) => u.id === pendingAction.id);
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-white/20">
                <p className="text-white text-2xl mb-4">
                  {pendingAction.type === "approve"
                    ? "Da li ste sigurni da želite da ODOBRITE pristup?"
                    : "Da li ste sigurni da želite da ODBIJETE pristup?"}
                </p>
                {user && (
                  <div className="bg-white/10 rounded-xl p-3 flex flex-col gap-3 mb-4 text-white">
                    <div className="font-semibold text-md text-gray-100">
                      <span className="text-green-600 font-bold">IME: </span>
                      {user.ime} {user.prezime}
                    </div>
                    <div className="text-md text-gray-100">
                      <span className="text-green-600 font-bold">MBR: </span>{" "}
                      {user.mbr ?? "-"}
                    </div>
                    <div className="text-md text-gray-100">
                      <span className="text-green-600 font-bold">POGON: </span>{" "}
                      {user.pogon ?? "-"}
                    </div>
                    <div className="text-md text-gray-100">
                      <span className="text-green-600 font-bold">SEKTOR: </span>{" "}
                      {user.sektor ?? "-"}
                    </div>
                  </div>
                )}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setPendingAction(null)}
                    disabled={loading}
                    className="px-4 py-2 cursor-pointer rounded-xl bg-gray-500 text-white"
                  >
                    Otkaži
                  </button>
                  <button
                    onClick={confirmAction}
                    disabled={loading}
                    className="px-4 py-2 cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  >
                    {loading ? "..." : "Potvrdi"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default OdobravanjePristupa;
