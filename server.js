const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

const manifest = {
    id: "community.globalultrap2p.v3",
    version: "3.0.0",
    name: "Global Ultra P2P All-In-One",
    description: "Çdo film dhe serial nga çdo shtet (Kore, Spanjë, Rusi, Kinë, SHBA). Pa kufizime.",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async (args) => {
    let streams = [];
    
    if (!args.id || !args.id.startsWith("tt")) {
        return { streams: [] };
    }

    try {
        const response = await axios.get(`https://strem.fun{args.type}/${args.id}.json`, {
            timeout: 6000
        }).catch(() => null);

        if (response && response.data && response.data.streams) {
            streams = response.data.streams.map(stream => {
                let hash = stream.infoHash;
                
                if (!hash && stream.url) {
                    const match = stream.url.match(/btih:([a-zA-Z0-9]+)/);
                    hash = match ? match[1] : null;
                }

                if (!hash) return null;

                let cleanTitle = stream.title || "";
                cleanTitle = cleanTitle.replace(/\[.*\]/g, "").trim();

                return {
                    name: "⚡ GlobalP2P",
                    title: `✨ [${stream.name || "Multi-Lang"}]\n${cleanTitle}`,
                    infoHash: hash.toLowerCase()
                };
            }).filter(s => s !== null);
        }
    } catch (error) {
        console.error("Gabim gjatë skanimit global:", error.message);
    }

    return { streams: streams };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: port });
