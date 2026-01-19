/// <reference types="vite/client" />
declare module '*.vue' {
    import type { DefineComponent } from "vue";
    const components: DefineComponent<{}, {}, any>
    export default components
}

declare module 'vuetify/styles';
declare module 'vuetify/lib/util/colors';