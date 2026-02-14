import { useEffect } from "react";

const VoiceFlowChat = () => {
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
		script.type = "text/javascript";
		script.async = true;

		script.onload = () => {
			window.voiceflow.chat.load({
				verify: { projectID: "66747077065c05d83d92baff" },
				url: "https://general-runtime.voiceflow.com",
				versionID: "production",
			});
		};

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return null;
};

export default VoiceFlowChat;
