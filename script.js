$(function () {
    let proto = "vmess";

    $("#protoSelect").on("click", "button", function () {
        proto = $(this).data("proto");
        $("#protoSelect button").removeClass("active");
        $(this).addClass("active");

        if (proto === "shadowsocks") {
            $("#ssMethodSection").show();
            $("#tlsSection").hide();
        } else {
            $("#ssMethodSection").hide();
            $("#tlsSection").show();
        }
    });

    $("#generateBtn").click(function () {
        const tag = $("#tag").val() || "proxy";
        const server = $("#server").val();
        const port = parseInt($("#port").val());
        const id = $("#id").val();
        const sni = $("#sni").val();
        const tlsEnabled = $("#tlsEnabled").val() === "true";
        const inAddr = $("#inAddr").val();
        const inPort = parseInt($("#inPort").val());

        if (!server || !port || !id) {
            alert("Please fill all required fields.");
            return;
        }

        let outbound = { tag, server, server_port: port };

        if (proto === "vmess") {
            outbound.type = "vmess";
            outbound.uuid = id;
            outbound.security = "auto";
            outbound.tls = {
                enabled: tlsEnabled,
                server_name: sni,
            };
        } else if (proto === "vless") {
            outbound.type = "vless";
            outbound.uuid = id;
            outbound.tls = {
                enabled: tlsEnabled,
                server_name: sni,
            };
        } else if (proto === "trojan") {
            outbound.type = "trojan";
            outbound.password = id;
            outbound.tls = {
                enabled: tlsEnabled,
                server_name: sni,
            };
        } else if (proto === "shadowsocks") {
            outbound.type = "shadowsocks";
            outbound.method = $("#ssMethod").val();
            outbound.password = id;
        }

        const config = {
            log: { level: "info" },
            inbounds: [
                {
                    type: "socks",
                    tag: "socks-in",
                    listen: inAddr,
                    listen_port: inPort,
                    sniff: true,
                    sniff_override_destination: true,
                },
            ],
            outbounds: [
                outbound,
                { type: "direct", tag: "direct" },
                { type: "block", tag: "block" },
            ],
        };

        $("#output").val(JSON.stringify(config, null, 2));
    });

    $("#copyBtn").click(function () {
        const text = $("#output").val();
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => alert("Copied!"));
    });

    $("#downloadBtn").click(function () {
        const text = $("#output").val();
        if (!text) return;
        
        // Create a more descriptive filename
        const tag = $("#tag").val() || "proxy";
        const server = $("#server").val() || "server";
        const filename = `singbox_${proto}_${tag}_${server}.json`;
        
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });
});
