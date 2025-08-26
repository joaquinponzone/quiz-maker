import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function POST(req: Request) {
    const { title, message, thread_ts } = await req.json();

    // Usar variable de entorno para el canal, con fallback a general
    const channel = process.env.SLACK_CHANNEL || "#general";

    try {
        const res = await slack.chat.postMessage({
            channel,
            thread_ts,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: title || `🚨 *Nuevo cuestionario generado*`,
                    },
                },
                {
                    type: "divider",
                },
                                 {
                     type: "section",
                     text: {
                         type: "mrkdwn",
                         text: message || "👾",
                     },
                 },
                {
                    type: "divider",
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "Enviado automágicamente por el bot 🤖",
                        },
                    ],
                },
            ],
        });

        return Response.json({ ok: true, ts: res.ts });
    } catch (err: any) {
        console.error("Slack error:", err);

        // Manejo específico de errores comunes
        if (err.code === 'slack_webapi_platform_error') {
            if (err.data?.error === 'not_in_channel') {
                return Response.json({
                    error: `El bot no está en el canal ${channel}. Necesitas invitarlo al canal o usar un canal diferente.`
                }, { status: 400 });
            }
            if (err.data?.error === 'channel_not_found') {
                return Response.json({
                    error: `El canal ${channel} no existe o el bot no tiene acceso.`
                }, { status: 400 });
            }
        }

        return Response.json({
            error: "Error al enviar mensaje a Slack",
            details: err.message
        }, { status: 500 });
    }
}
