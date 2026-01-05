import React, { useEffect, useState } from "react";

const ROOT_URL = "https://nashcentral.duckdns.org/media/";

export default function Browser() {
  const [currentUrl, setCurrentUrl] = useState(ROOT_URL);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch(
      `http://localhost:4000/api/list?url=${encodeURIComponent(currentUrl)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUrl]);

  return (
    <>
      <div className="header">
        <h1>Media Browser</h1>
        <div className="path">{currentUrl}</div>
      </div>

      {loading && <p>Loading...</p>}

      <div className="grid">
        {items.map((item) => (
          <div
            key={item.href}
            className={`card ${item.isDir ? "folder" : "file"}`}
            onClick={() => {
              if (item.isDir) {
                setCurrentUrl(currentUrl + item.href);
              } else {
                window.open(currentUrl + item.href, "_blank");
              }
            }}
          >
            <div className="icon">
              {item.isDir ? "📁" : "🎬"}
            </div>
            <div className="name">{item.name}</div>
          </div>
        ))}
      </div>
    </>
  );
}
