import { useState, useCallback } from 'react';
import { Apartment, getRandomApartments, formatPrice, calculateScore } from './data/apartments';

type Screen = 'home' | 'game' | 'result';

interface RoundResult {
  apartment: Apartment;
  guess: number;
  score: number;
  diff: number;
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [rounds, setRounds] = useState<Apartment[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [guess, setGuess] = useState(500000);
  const [answered, setAnswered] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [sliderAnimated, setSliderAnimated] = useState(false);

  const startGame = useCallback(() => {
    const selected = getRandomApartments(10);
    setRounds(selected);
    setCurrentRound(0);
    setResults([]);
    setGuess(500000);
    setAnswered(false);
    setCurrentPhoto(0);
    setSliderAnimated(false);
    setScreen('game');
    // Trigger slider animation after mount
    setTimeout(() => setSliderAnimated(true), 100);
  }, []);

  const handleAnswer = () => {
    if (answered) return;
    setAnswered(true);
    const apt = rounds[currentRound];
    const score = calculateScore(guess, apt.price);
    const diff = guess - apt.price;
    setResults(prev => [...prev, { apartment: apt, guess, score, diff }]);
  };

  const nextRound = () => {
    if (currentRound >= 9) {
      setScreen('result');
    } else {
      setCurrentRound(prev => prev + 1);
      setGuess(500000);
      setAnswered(false);
      setCurrentPhoto(0);
      setSliderAnimated(false);
      setTimeout(() => setSliderAnimated(true), 100);
    }
  };

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const totalDiff = results.reduce((sum, r) => sum + r.diff, 0);
  const avgDiffPercent = results.length > 0
    ? results.reduce((sum, r) => sum + (r.diff / r.apartment.price) * 100, 0) / results.length
    : 0;

  const getResultTitle = () => {
    if (avgDiffPercent > 15) return 'Щедрый инвестор';
    if (avgDiffPercent < -15) return 'Скряга';
    return 'Опытный инвестор';
  };

  const getResultDescription = () => {
    if (avgDiffPercent > 15) return 'Вы склонны переплачивать за недвижимость. Будьте внимательнее при оценке!';
    if (avgDiffPercent < -15) return 'Вы экономный инвестор, иногда недооцениваете стоимость. Рынок может быть дороже, чем кажется.';
    return 'Отличный результат! Вы хорошо чувствуете рынок недвижимости Коми.';
  };

  const getResultEmoji = () => {
    if (avgDiffPercent > 15) return '💰';
    if (avgDiffPercent < -15) return '🤏';
    return '🎯';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#0050cf] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <span className="text-2xl">🏠</span>
        <h1 className="text-lg font-bold">Медиакоми</h1>
        {screen === 'game' && (
          <div className="ml-auto text-sm opacity-90">
            {currentRound + 1}/10
          </div>
        )}
      </header>

      {/* Progress bar */}
      {screen === 'game' && (
        <div className="w-full bg-gray-200 h-1.5">
          <div
            className="h-full bg-[#0050cf] transition-all duration-300"
            style={{ width: `${((currentRound + (answered ? 1 : 0)) / 10) * 100}%` }}
          />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {screen === 'home' && <HomeScreen onStart={startGame} />}
        {screen === 'game' && rounds.length > 0 && (
          <GameScreen
            apartment={rounds[currentRound]}
            guess={guess}
            setGuess={setGuess}
            answered={answered}
            onAnswer={handleAnswer}
            onNext={nextRound}
            currentPhoto={currentPhoto}
            setCurrentPhoto={setCurrentPhoto}
            sliderAnimated={sliderAnimated}
          />
        )}
        {screen === 'result' && (
          <ResultScreen
            totalScore={totalScore}
            results={results}
            totalDiff={totalDiff}
            avgDiffPercent={avgDiffPercent}
            title={getResultTitle()}
            description={getResultDescription()}
            emoji={getResultEmoji()}
            onRestart={startGame}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-500">
        <p>Медиакоми © 2026 — Симулятор оценки недвижимости</p>
        <p className="mt-1">Данные: объявления о продаже квартир в Республике Коми</p>
      </footer>
    </div>
  );
}

// ============ HOME SCREEN ============
function HomeScreen({ onStart }: { onStart: () => void }) {
  // Sample photos for gallery
  const galleryPhotos = [
    "https://b20.img.avito.st/image/1/1.EmRZCra-vo1PqhyMcT4hL2yqvIvrvbqN69rfh-cJvy_sqbw.-lmP__0lfZ9qQruVsBv94-9EqnuJq_0YxZiX3IheySo?cqp=2.6_1L9vhKD2uBLt-qyrAoZheVsuS8u7cVFre6r7a9jrN4_pCIDjlm5anolzs-MLkTK_L9899P2epdVNs=",
    "https://80.img.avito.st/image/1/1.GcAR67a-tSkHSxcoL-N8jRJLty-jXLEpozvUI6_otIukSLc.tT4Ba_SFcQpqnXHIiMrkWNKSEiZ3hGB-M2N3wwXC4o4",
    "https://c80.img.avito.st/image/1/1.DKa-w7a-oE-oYwJOqtsro7xjokkMdKRPDBPBRQDAoe0LYKI.bQP_4n5hCPUXtaqoLSJsa7brfeyH55XSirleCISXY3c",
    "https://10.img.avito.st/image/1/1.y9JnqLa-ZztxCMU6fd_Y6kYIZT3VH2M71XgGMdmrZpnSC2U.kzEfWKX4iqBDgBAo5BL2_RdMkRPbRD4OGRM6ueP-Y_U?cqp=2.6_1L9vhKD2uBLt-qyrAoZheVsuS8u7cVFre6r7a9jrN4_pCIDjlm5anolzs-MLkTK_L9899P2epdVNs=",
    "https://b40.img.avito.st/image/1/1.uzz4OLa-F9XumLXUghb6P8WYFdNKjxPVSuh230Y7FndNmxU.G1RiyQyF2VS_YIgauNeTEvM7MBFmCO9VoRUcBg-7u04",
    "https://b30.img.avito.st/image/1/1.Y-P3Ora-zwrhmm0LvWdGi9yazQxFjcsKRequAEk5zqhCmc0.QXnl_MFFN94eJzAh9NKHHyffIiJW-4HjSl8fsMqiyFU?cqp=2.6_1L9vhKD2uBLt-qyrAoZheVsuS8u7cVFre6r7a9jrN4_pCIDjlm5anolzs-MLkTK_L9899P2epdVNs=",
  ];

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 overflow-y-auto">
      <div className="text-5xl mb-3">🏘️</div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
        Угадай цену квартиры
      </h2>
      <p className="text-gray-600 text-center max-w-sm mb-4 text-sm leading-relaxed">
        Посмотрите фото и описание квартиры. Передвигайте бегунок, чтобы назвать свою цену.
        Насколько точно вы оцените недвижимость в Коми?
      </p>

      {/* Photo gallery */}
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-sm mb-4">
        {galleryPhotos.map((photo, i) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={photo}
              alt={`Пример квартиры ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* How to play */}
      <div className="bg-white rounded-xl shadow-sm p-3 w-full max-w-sm mb-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-1.5">Как играть:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-[#0050cf] font-bold">①</span>
            <span>10 случайных объявлений</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0050cf] font-bold">②</span>
            <span>Двигайте бегунок, чтобы оценить</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0050cf] font-bold">③</span>
            <span>Нажмите «Оценить» — узнайте ответ</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0050cf] font-bold">④</span>
            <span>Чем ближе к цене — тем больше баллов!</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onStart}
        className="bg-[#0050cf] hover:bg-[#0040a8] active:bg-[#003590] text-white font-bold py-3.5 px-10 rounded-xl text-lg shadow-lg transition-all active:scale-95 w-full max-w-sm"
      >
        🚀 Запустить игру
      </button>
    </div>
  );
}

// ============ GAME SCREEN ============
function GameScreen({
  apartment,
  guess,
  setGuess,
  answered,
  onAnswer,
  onNext,
  currentPhoto,
  setCurrentPhoto,
  sliderAnimated,
}: {
  apartment: Apartment;
  guess: number;
  setGuess: (v: number) => void;
  answered: boolean;
  onAnswer: () => void;
  onNext: () => void;
  currentPhoto: number;
  setCurrentPhoto: (v: number) => void;
  sliderAnimated: boolean;
}) {
  const minPrice = 50000;
  const maxPrice = 2000000;
  const diff = guess - apartment.price;
  const diffPercent = ((diff / apartment.price) * 100).toFixed(1);
  const score = answered ? calculateScore(guess, apartment.price) : 0;

  return (
    <div className="flex-1 flex flex-col px-3 py-2 overflow-y-auto">
      {/* Photo gallery */}
      <div className="relative w-full aspect-[16/10] bg-gray-200 rounded-xl overflow-hidden mb-2 flex-shrink-0">
        {apartment.photos.length > 0 ? (
          <img
            src={apartment.photos[currentPhoto]}
            alt={`Фото квартиры ${currentPhoto + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
            <span className="text-4xl">🏠</span>
          </div>
        )}
        {/* Photo dots */}
        {apartment.photos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {apartment.photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhoto(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentPhoto ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        {/* Photo counter */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {currentPhoto + 1}/{apartment.photos.length}
        </div>
      </div>

      {/* Apartment info */}
      <div className="bg-white rounded-lg p-2.5 shadow-sm mb-2 flex-shrink-0">
        <p className="font-semibold text-gray-900 text-sm">{apartment.description}</p>
        <p className="text-gray-500 text-xs mt-0.5">📍 {apartment.address}</p>
      </div>

      {/* Price slider */}
      <div className="bg-white rounded-lg p-3 shadow-sm mb-2 flex-shrink-0">
        <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5 block">Ваша оценка:</label>
        <div className="text-xl font-bold text-[#0050cf] mb-2 text-center">
          {formatPrice(guess)}
        </div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={10000}
          value={guess}
          onChange={(e) => setGuess(Number(e.target.value))}
          disabled={answered}
          className={`w-full h-2.5 rounded-full appearance-none cursor-pointer bg-gray-200
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0050cf]
            [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
            ${sliderAnimated ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: answered
              ? `linear-gradient(to right, #0050cf 0%, #0050cf ${(apartment.price / maxPrice) * 100}%, #e5e7eb ${(apartment.price / maxPrice) * 100}%, #e5e7eb 100%)`
              : `linear-gradient(to right, #0050cf 0%, #0050cf ${((guess - minPrice) / (maxPrice - minPrice)) * 100}%, #e5e7eb ${((guess - minPrice) / (maxPrice - minPrice)) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
          <span>50 000 ₽</span>
          <span>2 000 000 ₽</span>
        </div>
      </div>

      {/* Answer / Result section */}
      {!answered ? (
        <button
          onClick={onAnswer}
          className="bg-[#0050cf] hover:bg-[#0040a8] active:bg-[#003590] text-white font-bold py-3 px-6 rounded-xl text-base shadow-md transition-all active:scale-95 w-full flex-shrink-0 mt-auto"
        >
          ✓ Оценить
        </button>
      ) : (
        <div className="bg-white rounded-lg p-3 shadow-sm mb-2 flex-shrink-0 mt-auto">
          <div className="text-center mb-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Правильная цена</p>
            <p className="text-xl font-bold text-green-600">{formatPrice(apartment.price)}</p>
            <p className="text-[10px] text-gray-400">{apartment.pricePerSqm}</p>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Разница</p>
              <p className={`font-bold text-xs ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-blue-500' : 'text-green-600'}`}>
                {diff > 0 ? '+' : ''}{formatPrice(diff)}
              </p>
              <p className={`text-[10px] ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-blue-400' : 'text-green-500'}`}>
                ({diff > 0 ? '+' : ''}{diffPercent}%)
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Баллы</p>
              <p className="text-xl font-bold text-[#0050cf]">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Вердикт</p>
              <p className={`font-bold text-xs ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-blue-500' : 'text-green-600'}`}>
                {diff > 0 ? '↑ Больше' : diff < 0 ? '↓ Меньше' : '✓ Точно!'}
              </p>
            </div>
          </div>
          <button
            onClick={onNext}
            className="mt-2 bg-[#0050cf] hover:bg-[#0040a8] active:bg-[#003590] text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md transition-all active:scale-95 w-full"
          >
            Далее →
          </button>
        </div>
      )}
    </div>
  );
}

// ============ RESULT SCREEN ============
function ResultScreen({
  totalScore,
  results,
  totalDiff,
  avgDiffPercent,
  title,
  description,
  emoji,
  onRestart,
}: {
  totalScore: number;
  results: RoundResult[];
  totalDiff: number;
  avgDiffPercent: number;
  title: string;
  description: string;
  emoji: string;
  onRestart: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col px-4 py-6 overflow-y-auto">
      {/* Result header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{emoji}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      {/* Score summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-[#0050cf]">{totalScore}</p>
            <p className="text-xs text-gray-500">из 1000</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${totalDiff > 0 ? 'text-red-500' : totalDiff < 0 ? 'text-blue-500' : 'text-green-600'}`}>
              {totalDiff > 0 ? '+' : ''}{formatPrice(totalDiff)}
            </p>
            <p className="text-xs text-gray-500">
              {totalDiff > 0 ? 'переплата' : totalDiff < 0 ? 'недоплата' : 'точно'}
            </p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${avgDiffPercent > 0 ? 'text-red-500' : avgDiffPercent < 0 ? 'text-blue-500' : 'text-green-600'}`}>
              {avgDiffPercent > 0 ? '+' : ''}{avgDiffPercent.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500">среднее</p>
          </div>
        </div>
      </div>

      {/* Round details */}
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-700">Детализация по раундам</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {results.map((r, i) => (
            <div key={i} className="px-3 py-2 flex items-center gap-2 text-xs">
              <span className="text-gray-400 w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 truncate">{r.apartment.description}</p>
                <p className="text-gray-400 truncate">{r.apartment.address}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-[#0050cf]">{r.score}</p>
                <p className={`text-[10px] ${r.diff > 0 ? 'text-red-400' : r.diff < 0 ? 'text-blue-400' : 'text-green-500'}`}>
                  {r.diff > 0 ? '+' : ''}{(r.diff / 1000).toFixed(0)}к
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restart button */}
      <button
        onClick={onRestart}
        className="bg-[#0050cf] hover:bg-[#0040a8] active:bg-[#003590] text-white font-bold py-4 px-6 rounded-xl text-base shadow-lg transition-all active:scale-95 w-full mt-auto"
      >
        🔄 Играть снова
      </button>
    </div>
  );
}

export default App;
