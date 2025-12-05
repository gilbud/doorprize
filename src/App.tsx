import { useState, useEffect, useRef } from "react";
import { Play, Trophy, Plus, X } from "lucide-react";

import hut from "./assets/hut.png";
import sport from "./assets/sport.png";
import danantara from "./assets/danan.png";

export default function LotterySpinner() {
  const [batchInput, setBatchInput] = useState("");
  const [nameList, setNameList] = useState([]);
  const [currentName, setCurrentName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);

  const audioContextRef = useRef(null);

  const playTickSound = () => {
    const audioContext =
      audioContextRef.current ||
      new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playWinSound = () => {
    const audioContext =
      audioContextRef.current ||
      new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + i * 0.15 + 0.3
      );

      oscillator.start(audioContext.currentTime + i * 0.15);
      oscillator.stop(audioContext.currentTime + i * 0.15 + 0.3);
    });
  };

  const addBatchNames = () => {
    if (!batchInput.trim()) return;

    // Split by newline or comma
    const names = batchInput
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0 && !nameList.includes(name));

    if (names.length > 0) {
      setNameList([...nameList, ...names]);
      setBatchInput("");
    }
  };

  const removeName = (name) => {
    setNameList(nameList.filter((n) => n !== name));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      addBatchNames();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSpinning && nameList.length > 0) {
      interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * nameList.length);
        setCurrentName(nameList[randomIndex]);
        playTickSound();
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpinning, nameList]);

  const startSpin = () => {
    if (isSpinning || nameList.length === 0) return;
    setWinner(null);
    setIsSpinning(true);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * nameList.length);
      const finalName = nameList[randomIndex];
      setCurrentName(finalName);
      setWinner(finalName);
      setIsSpinning(false);
      setHistory((prev) => [finalName, ...prev.slice(0, 9)]);
      playWinSound();
    }, 3000);
  };

  const reset = () => {
    setCurrentName("");
    setWinner(null);
    setIsSpinning(false);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-8 drop-shadow-lg flex justify-center items-end gap-5">
          <img src={sport} className="h-20" alt="" />
          DoorPrize
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 my-20 ">
          {/* Display Name */}
          <div className="relative ">
            <div
              className={`bg-gradient-to-br from-blue-300 to-blue-500 rounded-3xl p-12 mb-6 shadow-inner ${
                isSpinning ? "animate-pulse" : ""
              }`}
            >
              <div className="text-center">
                <div className="text-5xl font-bold text-white drop-shadow-lg mb-2 min-h-[80px] flex items-center justify-center">
                  {currentName || "???"}
                </div>
                {winner && (
                  <div className="flex items-center justify-center gap-2 text-white text-2xl font-semibold animate-bounce">
                    <Trophy className="w-8 h-8" />
                    Pemenang!
                    <Trophy className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>

            {isSpinning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={startSpin}
              disabled={isSpinning || nameList.length === 0}
              className="flex-1 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform cursor-pointer transition disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <Play className="w-6 h-6" />
              {isSpinning
                ? "Sedang Berputar..."
                : nameList.length === 0
                ? "Tambah Peserta Dulu"
                : "Mulai Undian"}
            </button>
            {/* <button
              onClick={reset}
              disabled={isSpinning}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button> */}
          </div>
        </div>

        {/* Batch Input - Moved to bottom */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="mb-6">
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Contoh:&#10;Ahmad&#10;Budi&#10;Citra&#10;&#10;atau: Ahmad, Budi, Citra&#10;&#10;(Tekan Ctrl+Enter untuk menambahkan)"
              disabled={isSpinning}
              rows={4}
              className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:border-purple-500 focus:outline-none text-lg resize-none"
            />
            <button
              onClick={addBatchNames}
              disabled={isSpinning || !batchInput.trim()}
              className="mt-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambah Nama
            </button>
          </div>

          {/* Name List */}
          {nameList.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Daftar Peserta ({nameList.length} orang)
              </label>
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl max-h-40 overflow-y-auto">
                {nameList.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold"
                  >
                    {name}
                    <button
                      onClick={() => removeName(name)}
                      disabled={isSpinning}
                      className="hover:bg-blue-200 rounded-full p-1 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Riwayat Pemenang
              </h2>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                Hapus Riwayat
              </button>
            </div>
            <div className="space-y-2">
              {history.map((name, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-lg font-bold rounded-xl p-4 shadow-md flex items-center gap-3"
                >
                  <span className="bg-white text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <img src={hut} className="h-20 absolute right-10 top-0 " alt="" />
        <img src={danantara} className="h-10 absolute left-10 top-5 " alt="" />
      </div>
    </div>
  );
}
