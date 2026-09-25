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
      moedas: 20,
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
  const [inShop, setInShop] = useState(false); // Novo estado para abrir/fechar a loja

  // Catálogo da Loja
  const shopItems = [
    { id: 1, name: "Pizza 🍕", cost: 10, fome: +35, alegria: +10 },
    { id: 2, name: "Maçã 🍎", cost: 5, fome: +15, saude: +5 },
    { id: 3, name: "Poção 🧪", cost: 15, saude: +40, sick: false },
    { id: 4, name: "Brinquedo 🧸", cost: 12, alegria: +30 }
  ];

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(pet));
  }, [pet]);

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
    }, 10000);

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
      novoXP -= 100;
      novoNivel += 1;
      triggerMsg("Subiu de Nível! 🎉");
    }
    return { xp: novoXP, nivel: novoNivel };
  };

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
      fome: Math.min(MAX, prev.fome + 20),
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

  const buyItem = (item) => {
    if (pet.moedas < item.cost) return triggerMsg("Moedas insuficientes!");
    setPet(prev => ({
      ...prev,
      moedas: prev.moedas - item.cost,
      fome: Math.min(MAX, prev.fome + (item.fome || 0)),
      alegria: Math.min(MAX, prev.alegria + (item.alegria || 0)),
      saude: Math.min(MAX, prev.saude + (item.saude || 0)),
      sick: item.sick !== undefined ? item.sick : prev.sick
    }));
    triggerMsg(`Comprou ${item.name}!`);
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
          {msg && <div style={{ position: 'absolute', top: 0, fontWeight: 'bold', zIndex: 10 }}>{msg}</div>}
          
          {inShop ? (
            <div style={{ fontSize: '11px', width: '100%', textAlign: 'center' }}>
              <strong>Lojinha</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '6px' }}>
                {shopItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => buyItem(item)}
                    style={{ fontSize: '10px', padding: '4px', cursor: 'pointer' }}
                  >
                    {item.name}<br/>🪙 {item.cost}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <svg className={`pixel-pet ${bounce ? 'bounce' : ''}`} viewBox="0 0 16 16" shapeRendering="crispEdges">
                {renderPetSvg()}
              </svg>
              <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.8 }}>
                Perfil: {pet.personalidade}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="buttons">
        <button className="btn" onClick={feed}>🍖<span className="btn-label">Comer</span></button>
        <button className="btn" onClick={play}>🎮<span className="btn-label">Brincar</span></button>
        <button className="btn" onClick={bath}>🛁<span className="btn-label">Banho</span></button>
        <button className="btn" onClick={sleep}>🌙<span className="btn-label">Dormir</span></button>
        <button className="btn" onClick={() => setInShop(!inShop)}>
          🏪<span className="btn-label">{inShop ? "Voltar" : "Loja"}</span>
        </button>
      </div>
    </div>
  );
                                                        }
                      
