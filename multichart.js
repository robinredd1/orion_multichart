(function(){
  const grid = document.getElementById("grid");
  const maxCharts = window.MAX_CHARTS || 6;
  let widgets = [];

  function tvConfig(symbol, interval, containerId){
    return {
      symbol: symbol,
      interval: interval || "D",
      container_id: containerId,
      autosize: true,
      timezone: "America/Chicago",
      theme: "light",
      style: "1",
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      details: true,
      calendar: true,
      studies: ["MACD@tv-basicstudies","RSI@tv-basicstudies"]
    };
  }

  function createCard(symbol){
    const id = "chart_"+Math.random().toString(36).slice(2,8);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-header">
        <div class="sym">${symbol}</div>
        <div class="actions">
          <input class="symInput" placeholder="Symbol" value="${symbol}"/>
          <select class="intervalSel">
            <option value="1">1m</option>
            <option value="5">5m</option>
            <option value="15">15m</option>
            <option value="60">60m</option>
            <option value="D" selected>1D</option>
          </select>
          <button class="applyBtn">Apply</button>
          <button class="removeBtn">Remove</button>
        </div>
      </div>
      <div class="chart" id="${id}"></div>
    `;
    grid.appendChild(card);

    const w = new TradingView.widget(tvConfig(symbol, "D", id));
    const record = {symbol, interval:"D", widget:w, id};
    widgets.push(record);

    card.querySelector(".applyBtn").addEventListener("click", ()=>{
      const newSym = card.querySelector(".symInput").value.trim().toUpperCase();
      const newInt = card.querySelector(".intervalSel").value;
      if (!newSym) return;
      card.querySelector(".chart").innerHTML = "";
      const newW = new TradingView.widget(tvConfig(newSym, newInt, id));
      record.symbol = newSym;
      record.interval = newInt;
      record.widget = newW;
      card.querySelector(".sym").textContent = newSym;
    });

    card.querySelector(".removeBtn").addEventListener("click", ()=>{
      grid.removeChild(card);
      widgets = widgets.filter(x => x.id !== id);
    });
  }

  function setAllInterval(interval){
    widgets.forEach(rec => {
      const node = document.getElementById(rec.id);
      if (!node) return;
      node.innerHTML = "";
      rec.widget = new TradingView.widget(tvConfig(rec.symbol, interval, rec.id));
      rec.interval = interval;
      const parentCard = node.closest(".card");
      if (parentCard) {
        const sel = parentCard.querySelector(".intervalSel");
        if (sel) sel.value = interval;
      }
    });
  }

  const init = (window.DEFAULT_SYMBOLS || ["AAPL"]).slice(0, maxCharts);
  init.forEach(sym => createCard(sym));

  document.getElementById("addBtn").addEventListener("click", ()=>{
    const val = document.getElementById("addSymbolInput").value.trim().toUpperCase();
    if (!val) return;
    if (widgets.length >= maxCharts) { alert("Reached max charts: " + maxCharts); return; }
    createCard(val);
  });

  document.getElementById("setAllBtn").addEventListener("click", ()=>{
    const tf = document.getElementById("intervalSel").value;
    setAllInterval(tf);
  });

  let ws = null;
  function setTapeStatus(s){ document.getElementById("tapeStatus").textContent = "WS: " + s; }
  function logTape(msg){
    const el = document.getElementById("tapeLog");
    const div = document.createElement("div");
    div.textContent = msg;
    el.prepend(div);
    while (el.children.length > 400) el.removeChild(el.lastChild);
  }
  function startTape(sym){
    if (!window.FINNHUB_KEY) { setTapeStatus("No key"); return; }
    if (ws) { try{ws.close();}catch(e){} ws=null; }
    const url = "wss://ws.finnhub.io?token=" + encodeURIComponent(window.FINNHUB_KEY);
    ws = new WebSocket(url);
    ws.onopen = ()=>{
      setTapeStatus("connected");
      ws.send(JSON.stringify({type:"subscribe", symbol:sym}));
    };
    ws.onmessage = (ev)=>{
      try{
        const data = JSON.parse(ev.data);
        if (data.type === "trade" && data.data){
          for (const t of data.data){
            logTape(new Date(t.t).toLocaleTimeString() + " " + t.s + " " + t.p);
          }
        }
      }catch(e){}
    };
    ws.onclose = ()=>setTapeStatus("closed");
    ws.onerror = ()=>setTapeStatus("error");
  }
  function stopTape(){ if (ws){ try{ws.close();}catch(e){} ws=null; setTapeStatus("stopped"); } }

  document.getElementById("tapeStart").addEventListener("click", ()=>{
    const sym = document.getElementById("tapeSymbol").value.trim().toUpperCase() || "AAPL";
    startTape(sym);
  });
  document.getElementById("tapeStop").addEventListener("click", stopTape);
})();