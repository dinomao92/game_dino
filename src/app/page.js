"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const students = [
    "number-1.png",
    "number-2.png",
    "number-3.png",
    "number-4.png",
    "number-5.png",
    "number-me.png",
  ];

  const [active, setActive] = useState(null);
  const [result, setResult] = useState("");
  const [step, setStep] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [endingImage, setEndingImage] = useState(null);

  const messages = [
    "歡迎來到上台答題地獄（點擊文字略過）",
    "點到你時就要上台回答惡魔班導的題目😈",
    "就讓我們馬上開始吧哈哈哈，祝福你成功躲過一劫",
  ];

  useEffect(() => {
    let index = 0;
    const fullText = step !== null && step >= 0 ? messages[step] : result || "";
    let tempText = "";

    const intervalId = setInterval(() => {
      tempText += fullText[index];
      setDisplayedText(tempText);
      index++;
      if (index >= fullText.length) {
        clearInterval(intervalId);
      }
    }, 40);

    return () => clearInterval(intervalId);
  }, [step, result]);

  const nextMessage = () => {
    if (gameStarted || step === null) return;
    const clickSound = new Audio("/sounds/button.mp3");
    clickSound.volume = 0.5;
    clickSound.play();

    if (step < messages.length - 1) {
      setStep(step + 1);
    } else {
      setStep(null);
      startGame();
    }
  };

  const selectSoundRef = useRef(null);

  const startGame = () => {
    const selectAudio = new Audio("/sounds/select.mp3");
    selectAudio.volume = 1.0;
    selectAudio.loop = true;
    selectAudio.play();
    selectSoundRef.current = selectAudio;

    setResult("惡魔班導點名中⋯⋯");
    setGameStarted(true);
    setEndingImage(null);

    let count = 0;
    const interval = 150;

    // 決定真正的選中對象
    const isLose = Math.random() < 0.5;
    const chosen = isLose ? 5 : Math.floor(Math.random() * 5);

    // 建立動畫序列，最後一個是 chosen
    const pool = Array.from({ length: 20 }, () => Math.floor(Math.random() * 6));
    const sequence = [...pool, chosen];

    const intervalId = setInterval(() => {
      setActive(sequence[count]);
      count++;

      if (count >= sequence.length) {
        clearInterval(intervalId);
        if (selectSoundRef.current) {
          selectSoundRef.current.pause();
          selectSoundRef.current.currentTime = 0;
        }

        setTimeout(() => {
          setActive(chosen);

          if (chosen === 5) {
            new Audio("/sounds/lose.mp3").play();
            setResult("你GG啦哈哈哈！");
            setTimeout(() => setEndingImage("lose"), 500 + Math.random() * 500);
          } else {
            new Audio("/sounds/victory.mp3").play();
            setResult("恭喜你逃過一劫，下次可就沒那麼幸運啦");
            setTimeout(() => setEndingImage("win"), 500 + Math.random() * 500);
          }

          setTimeout(() => {
            setShowResultScreen(true);
          }, 3000);
        }, 200);
      }
    }, interval);
  };

  const resetGame = () => {
    setStep(0);
    setActive(null);
    setResult("");
    setGameStarted(false);
    setShowResultScreen(false);
    setEndingImage(null);
  };

  return (
    <div className="absolute inset-0 w-full min-h-screen bg-black text-white flex flex-col items-center overflow-x-hidden">
      {showResultScreen ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="flex flex-wrap justify-center gap-4 max-w-[620px]">
            <button onClick={resetGame} className="transition-transform hover:scale-110">
              <Image src="/images/restart.png" alt="Restart" width={300} height={100} className="w-[200px]" />
            </button>
            <button className="transition-transform hover:scale-110">
              <Image src="/images/back.png" alt="Back" width={300} height={100} className="w-[200px]" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center mt-12 mb-6 w-full max-w-6xl px-4 gap-2">
            <Image src="/images/torch.png" alt="torch" width={64} height={64} className="w-10 h-10 object-contain" />
            <div className="relative w-[360px] sm:w-[520px] md:w-[680px] h-[100px] sm:h-[120px] md:h-[140px]">
              <Image
                src="/images/banner.png"
                alt="message box"
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-contain"
              />
              <div
                className={`absolute inset-0 flex justify-center items-center text-xs sm:text-base md:text-lg text-white text-center px-6 leading-snug ${
                  gameStarted ? "cursor-default pointer-events-none" : "cursor-pointer"
                }`}
                onClick={nextMessage}
              >
                {displayedText}
              </div>
            </div>
            <Image src="/images/torch.png" alt="torch" width={64} height={64} className="w-10 h-10 object-contain" />
          </div>

          {endingImage && (
            <div className="my-6">
              <Image
                src={`/images/${endingImage}.png`}
                alt={endingImage}
                width={200}
                height={200}
                className="mx-auto"
              />
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-12 max-w-5xl px-10 py-10 w-full justify-items-center">
            {students.map((filename, i) => (
              <div key={i} className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
                <img
                  src={`/images/${filename}`}
                  className={`w-full h-full object-contain image-rendering-pixel ${
                    active === i ? "brightness-50" : ""
                  }`}
                  alt={`Student ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {!showResultScreen && (
        <div
          className="fixed bottom-0 left-0 w-full h-[100px] bg-repeat-x bg-contain bg-bottom z-10"
          style={{ backgroundImage: "url('/images/fire.png')" }}
        />
      )}
    </div>
  );
}
