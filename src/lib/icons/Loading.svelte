
<!-- Source: https://loading.io/css/ -->
<!-- Altered by @atjn for better performance and responsiveness -->
<div class="loader">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
</div>

<style>
    .loader {
        display: inline-block;
        position: relative;
        width: 5em;
    }
    .loader div {
        position: absolute;
        bottom: 0;
        width: .6em;
        height: .6em;
        border-radius: 100%;
        background-color: currentColor;
    }
    .loader div:nth-child(1) {
        left: 10%;
        animation: loader1 0.6s infinite;
    }
    .loader div:nth-child(2) {
        left: 10%;
        animation: loader2 0.6s infinite;
    }
    .loader div:nth-child(3) {
        left: 40%;
        animation: loader2 0.6s infinite;
    }
    .loader div:nth-child(4) {
        left: 70%;
        animation: loader3 0.6s infinite;
    }
    @keyframes loader1 {
        0% {
            transform: scale(0);
        }
        100% {
            transform: scale(1);
        }
    }
    @keyframes loader2 {
        0% {
            transform: translate(0, 0);
        }
        100% {
            transform: translate(1.5em, 0);
        }
    }
    @keyframes loader3 {
        0% {
            transform: scale(1);
        }
        100% {
            transform: scale(0);
        }
    }
</style>
