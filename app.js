const { useState, useEffect } = React;

const KEY = "tenorio-otavio-react-v1";
const MAX = 100;

// Paleta de cores do Sprite em Pixel Art
const PALETTE = {
  0: "transparent",
  1: "#1f3a24",
  2: "#4caf5e",
  3: "#357a42",
  4: "#eafbe0",
  5: "#1f3a24",
  6: "#e07a5a",
  7: "#2f8f4a",
  8: "#f2c14e"
};

const FRAME_AWAKE = [
  "...8..0000..8...",
  "..118..00..811..",
  "..1177777711....",
  ".71177777711117.",
  "711222222221117.",
  "1122255225221117",
  "1122222222211117",
  "1122266622211117",
  "1122222222211107",
  "1123222222311...",
  ".1234444443221..",
  ".1123444443221..",
  "..1123333332211.",
  "...1122222211...",
  "....111..111....",
  "...1..7....7...."
];

const FRAME_SLEEP = [
  "................",
  "...8......8.....",
  "..118......811..",
  "..1177777711....",
  ".71177777711117.",
  "711222222221117.",
  "1122211122211117",
  "1122222222211117",
  "1122222222211107",
  "1123222222311...",
  ".1234444443221..",
  ".1123444443221..",
  "..1123333332211.",
  "...1122222211...",
  "....111..111....",
  "................"
];

// Componente para desenhar as barras de status
function StatBar({ label, value }) {
  return (
    <div className="stat">
      <div>{label}</div>
      <div className="bar-bg">
        <div className="bar-fill" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function App() {
  const [pet, setPet] = useState(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      fome: 80,
      alegria: 80,
      higiene: 80,
      saude: 100,
      moedas: 10,
      xp: 0,
      nivel: 1,
      personalidade: "Equilibrado",
      historicoAcoes: { comer: 0, brincar: 0 },
      sleeping: false,
      sick: false,
      lastUpdate: Date.now()
    };
  });

  const [msg, setMsg] = useState("");
  const [bounce, setBounce] = useState(false);

  // Salvar automaticamente no localStorage
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(pet));
  }, [pet]);

  // Loop de Decaimento do tempo
  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prev => {
        const rate = prev.sleeping ? 0.3 : 1;
        const novaFome = Math.max(0, prev.fome - 0.5 * rate);
        const novaAlegria = Math.max(0, prev.alegria - 0.4 * rate);
        const novaHigiene = Math.max(0, prev.higiene - 0.3 * rate);
        let novaSaude = prev.saude;

        if (novaFome < 20 || novaHigiene < 20) {
          novaSaude = Math.max(0, prev.saude - 0.5);
        }

        return {
          ...prev,
          fome: novaFome,
          alegria: novaAlegria,
          higiene: novaHigiene,
          saude: novaSaude,
          sick: novaSaude < 30,
          lastUpdate: Date.now()
        };
      });
    }, 10000); // atualiza a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const triggerMsg = (text) => {
    setMsg(text);
    setBounce(true);
    setTimeout(() => setMsg(""), 1500);
    setTimeout(() => setBounce(false), 500);
  };

  const updateXP = (qtd) => {
    let novoXP = pet.xp + qtd;
    let novoNivel = pet.nivel;
    if (novoXP >= 100) {
      novoXP = novoXP - 100;
      novoNivel += 1;
      triggerMsg("Subiu de Nível! 🎉");
    }
    return { xp: novoXP, nivel: novoNivel };
  };

  // Avalia personalidade inteligente com base nas ações
  const calcularPersonalidade = (acoes) => {
    if (acoes.comer > acoes.brincar + 5) return "Gulosão 🍔";
    if (acoes.brincar > acoes.comer + 5) return "Atleta ⚽";
    return "Equilibrado ⚖️";
  };

  const feed = () => {
    if (pet.sleeping) return triggerMsg("zzz... Dormindo!");
    const acoes = { ...pet.historicoAcoes, comer: pet.historicoAcoes.comer + 1 };
    const xpInfo = updateXP(15);
    setPet(prev => ({
      ...prev,
      fome: Math.min(MAX, prev.fome + 25),
      higiene: Math.max(0, prev.higiene - 5),
      moedas: prev.moedas + 2,
      historicoAcoes: acoes,
      personalidade: calcularPersonalidade(acoes),
      ...xpInfo
    }));
    triggerMsg("Nham nham! +2 🪙");
  };

  const play = () => {
    if (pet.sleeping) return triggerMsg("zzz... Dormindo!");
    const acoes = { ...pet.historicoAcoes, brincar: pet.historicoAcoes.brincar + 1 };
    const xpInfo = updateXP(20);
    setPet(prev => ({
      ...prev,
      alegria: Math.min(MAX, prev.alegria + 25),
      fome: Math.max(0, prev.fome - 10),
      moedas: prev.moedas + 5,
      historicoAcoes: acoes,
      personalidade: calcularPersonalidade(acoes),
      ...xpInfo
    }));
    triggerMsg("Muito divertido! +5 🪙");
  };

  const bath = () => {
    if (pet.sleeping) return triggerMsg("zzz... Dormindo!");
    setPet(prev => ({ ...prev, higiene: Math.min(MAX, prev.higiene + 30) }));
    triggerMsg("Limpinho! ✨");
  };

  const sleep = () => {
    setPet(prev => ({ ...prev, sleeping: !prev.sleeping }));
    triggerMsg(pet.sleeping ? "Bom dia! ☀️" : "Boa noite... 🌙");
  };

  const renderPetSvg = () => {
    const frame = pet.sleeping ? FRAME_SLEEP : FRAME_AWAKE;
    return frame.map((row, y) =>
      row.split("").map((ch, x) => {
        const color = PALETTE[ch];
        return color ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} /> : null;
      })
    );
  };

  return (
    <div className="device">
      <div className="title">TENÓRIO OTÁVIO</div>
      
      <div className="screen">
        <div style={{ fontSize: '11px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Nível {pet.nivel} (XP: {pet.xp}%)</span>
          <span>🪙 {pet.moedas}</span>
        </div>

        <div className="stats">
          <StatBar label="🍖 Fome" value={pet.fome} />
          <StatBar label="😊 Alegria" value={pet.alegria} />
          <StatBar label="🧼 Higiene" value={pet.higiene} />
          <StatBar label="💪 Saúde" value={pet.saude} />
        </div>

        <div className="stage">
          {msg && <div style={{ position: 'absolute', top: 0, fontWeight: 'bold' }}>{msg}</div>}
          
          <svg className={`pixel-pet ${bounce ? 'bounce' : ''}`} viewBox="0 0 16 16" shapeRendering="crispEdges">
            {renderPetSvg()}
          </svg>

          <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.8 }}>
            Perfil: {pet.personalidade}
          </div>
        </div>
      </div>

      <div className="buttons">
        <button className="btn" onClick={feed}>🍖<span className="btn-label">Comer</span></button>
        <button className="btn" onClick={play}>🎮<span className="btn-label">Brincar</span></button>
        <button className="btn" onClick={bath}>🛁<span className="btn-label">Banho</span></button>
        <button className="btn" onClick={sleep}>🌙<span className="btn-label">Dormir</span></button>
        <button className="btn" onClick={() => triggerMsg("Em breve!")}>🏪<span className="btn-label">Loja</span></button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
