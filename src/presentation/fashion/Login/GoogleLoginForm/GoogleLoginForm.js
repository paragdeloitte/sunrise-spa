import { reactive, watch } from "vue";
import config from "../../../../../sunrise.config";



const libraryState = reactive({
    gsiApiLoadInitiated: false,
    gsiApiLoaded: false
})

const buttonConfig = {
    theme: "outline",
    size: "large"
}

const handleCredentialResponse = async (response) => {
    console.log("JWT Response", response);

    // Uninstalling jose
    // To reinstall jose - npm install jose
    // const responsePayload = await jose.decodeJwt(response.credential);

    // console.log("Response Payload", responsePayload);

    // console.log("ID: " + responsePayload.sub);
    // console.log('Full Name: ' + responsePayload.name);
    // console.log('Given Name: ' + responsePayload.given_name);
    // console.log('Family Name: ' + responsePayload.family_name);
    // console.log("Image URL: " + responsePayload.picture);
    // console.log("Email: " + responsePayload.email);
}

const idConfiguration = {
    client_id: config.gsi.auth.credentials.clientId,
    auto_select: false,
    callback: handleCredentialResponse
}

const options = reactive({
    prompt: false,
    autoLogin: false,
    buttonConfig: buttonConfig,
    error: null,
})

let loadGsiApi = new Promise((resolve) => {
    const isRunningInBrowser = typeof window !== "undefined";

    if (!libraryState.gsiApiLoadInitiated && isRunningInBrowser) {
        let gsiScript = document.createElement('script');
        libraryState.gsiApiLoadInitiated = true;
        gsiScript.addEventListener("load", () => {
            libraryState.gsiApiLoaded = true;
            resolve(window.google);
        });
        gsiScript.src = config.gsi.clientLibraryUrl;
        gsiScript.async = true;
        gsiScript.defer = true;
        document.head.appendChild(gsiScript);
    }
});

function googleSDKLoaded(action) {
    if (!libraryState.gsiApiLoadInitiated) {
        loadGsiApi.then((google) => {
            action(google);
        });
    } else if (!libraryState.gsiApiLoaded) {
        watch(
            () => libraryState.gsiApiLoaded,
            (loaded) => {
                loaded && action(window.google);
            }
        );
    } else {
        action(window.google);
    }
}

function renderLoginButton(idConfiguration, buttonRef, buttonConfig) {
    window.google.accounts.id.initialize(idConfiguration);
    const button = buttonRef;
    if (button) {
        window.google.accounts.id.renderButton(button, buttonConfig);
    }
}



export default {
    computed: {
        libraryState() {
            return libraryState;
        }

    },
    mounted() {
        if (!config.gsi.clientLibraryUrl) {
            throw new Error("Client Library URL is not configured");
        }
        if (!config.gsi.auth.credentials.clientId) {
            throw new Error("Client ID is not configured");
        }
        googleSDKLoaded(() => {
            renderLoginButton(idConfiguration, this.$refs.buttonRef, options.buttonConfig);
        });
    }
}