fetch('/sync/WebAppMarketDB.json')
  .then(res => res.json())
  .then(data => {
    console.log("? Datele JSON:", data);
  })
  .catch(err => console.error("? Eroare la încarcare:", err));
