export default {
    mounted() {
        let gsiScript = document.createElement('script');
        gsiScript.setAttribute('src', 'https://accounts.google.com/gsi/client');
        document.head.appendChild(gsiScript);
    }
}