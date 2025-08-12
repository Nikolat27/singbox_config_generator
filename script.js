// Ensure jQuery is loaded
if (typeof jQuery === 'undefined') {
    console.error('jQuery is not loaded!');
} else {
    $(document).ready(function() {
    let proto = "vmess";

                    $("#protoSelect").change(function () {
                    proto = $(this).val();

                    if (proto === "shadowsocks") {
                        $("#ssMethodSection").show();
                        $("#tlsSection").hide();
                    } else {
                        $("#ssMethodSection").hide();
                        $("#tlsSection").show();
                    }
                });

                // Handle security type changes
                $("#securityType").change(function() {
                    const securityType = $(this).val();
                    if (securityType === "reality") {
                        $("#tlsSettings").hide();
                        $("#realitySettings").show();
                    } else if (securityType === "tls") {
                        $("#tlsSettings").show();
                        $("#realitySettings").hide();
                    } else {
                        $("#tlsSettings").hide();
                        $("#realitySettings").hide();
                    }
                });

                // Handle network type changes
                $("#networkType").change(function() {
                    const networkType = $(this).val();
                    if (networkType === "xhttp") {
                        $("#xhttpSettings").show();
                    } else {
                        $("#xhttpSettings").hide();
                    }
                });

                    $("#generateBtn").click(function () {
                    const tag = $("#tag").val() || "proxy";
                    const server = $("#server").val();
                    const port = parseInt($("#port").val());
                    const id = $("#id").val();
                    const inAddr = $("#inAddr").val();
                    const inPort = parseInt($("#inPort").val());

                    if (!server || !port || !id) {
                        alert("Please fill all required fields.");
                        return;
                    }

                    let outbound = { tag };

                    if (proto === "vmess") {
                        const sni = $("#sni").val();
                        const tlsEnabled = $("#tlsEnabled").val() === "true";
                        
                        outbound.type = "vmess";
                        outbound.server = server;
                        outbound.server_port = port;
                        outbound.uuid = id;
                        outbound.tls = {
                            enabled: tlsEnabled,
                            server_name: sni,
                        };
                    } else if (proto === "vless") {
                        const securityType = $("#securityType").val();
                        const networkType = $("#networkType").val();
                        
                        outbound.type = "vless";
                        outbound.server = server;
                        outbound.server_port = port;
                        outbound.uuid = id;
                        outbound.encryption = "none";

                        // Handle different security types
                        if (securityType === "tls") {
                            const sni = $("#sni").val();
                            const tlsEnabled = $("#tlsEnabled").val() === "true";
                            outbound.tls = {
                                enabled: tlsEnabled,
                                server_name: sni,
                            };
                        } else if (securityType === "reality") {
                            const realityServerName = $("#realityServerName").val();
                            const realityFingerprint = $("#realityFingerprint").val();
                            const realityPublicKey = $("#realityPublicKey").val();
                            const realityShortId = $("#realityShortId").val();
                            const realitySpiderX = $("#realitySpiderX").val();
                            
                            outbound.tls = {
                                enabled: true,
                                server_name: realityServerName,
                                fingerprint: realityFingerprint,
                                reality: {
                                    public_key: realityPublicKey,
                                    short_id: realityShortId,
                                    spider_x: realitySpiderX
                                }
                            };
                        }

                        // Handle different network types
                        if (networkType === "xhttp") {
                            const xhttpPath = $("#xhttpPath").val();
                            const xhttpMode = $("#xhttpMode").val();
                            
                            outbound.transport = {
                                type: "http",
                                path: xhttpPath,
                                method: xhttpMode
                            };
                        } else if (networkType === "ws") {
                            outbound.transport = {
                                type: "ws"
                            };
                        }
                    } else if (proto === "trojan") {
                        const sni = $("#sni").val();
                        const tlsEnabled = $("#tlsEnabled").val() === "true";
                        
                        outbound.type = "trojan";
                        outbound.server = server;
                        outbound.server_port = port;
                        outbound.password = id;
                        outbound.tls = {
                            enabled: tlsEnabled,
                            server_name: sni,
                        };
                    } else if (proto === "shadowsocks") {
                        outbound.type = "shadowsocks";
                        outbound.server = server;
                        outbound.server_port = port;
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

    $("#clearBtn").click(function () {
        // Reset all form fields
        $("#tag").val("");
        $("#server").val("");
        $("#port").val("");
        $("#id").val("");
        $("#sni").val("");
        $("#inAddr").val("127.0.0.1");
        $("#inPort").val("1080");
        $("#ssMethod").val("");
        
        // Reset new VLESS fields
        $("#securityType").val("tls");
        $("#networkType").val("tcp");
        $("#realityServerName").val("");
        $("#realityFingerprint").val("chrome");
        $("#realityPublicKey").val("");
        $("#realityShortId").val("");
        $("#realitySpiderX").val("");
        $("#xhttpPath").val("");
        $("#xhttpMode").val("auto");
        
        // Reset protocol selection to VMess
        proto = "vmess";
        $("#protoSelect").val("vmess");
        
        // Show TLS section and hide other sections
        $("#tlsSection").show();
        $("#ssMethodSection").hide();
        $("#tlsSettings").show();
        $("#realitySettings").hide();
        $("#xhttpSettings").hide();
        
        // Clear the output
        $("#output").val("");
    });
    });
}
