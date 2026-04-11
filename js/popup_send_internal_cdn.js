(function() {

    function sendInternalEventWithEmail(email){
        console.log('sendInternalEventWithEmail', email);
        var utmTerm = new URLSearchParams(window.location.search).get('utm_term');
        let shopifyDomain;
        let shopifyId;
        if (window.Shopify && window.Shopify.shop) {
            shopifyDomain = window.Shopify.shop;
            shopifyId = shopifyDomain.split('.myshopify.com')[0];        
        }      
        // Para URL e dominio, voce pode usar metodos JavaScript puros que funcionam em qualquer ambiente
        var currentDomain = window.location.hostname;

        // Funcao para pegar o valor numerico inteiro se existir, senao pegar o primeiro valor
        function getUTMParameter(param, params) {
            const values = params.getAll(param).map(v => v.toLowerCase());            
            if (param === 'utm_campaign' || param === 'utm_content' ) {
                for (let value of values) {
                    if (/^\d+$/.test(value)) {
                        return value;
                    }
                }
            }

            if (param === 'utm_source' || param === 'sol_source') {
                const group = [ 'fb', 'ig', 'an', 'msg', 'facebook', 'facebookads','google', 'gg', 'institucional', 'discovery', 'pesquisa', 'youtube', 'kwai', 'tiktok'];
                for (let preferred of group) {
                    if (values.includes(preferred)) {
                        return preferred;
                    }
                }
            }
            return values[0] || '';
        }

        


        
        // Funcao para ler um cookie pelo nome
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    // Verifica se o cookie comeca com o nome especificado
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }

        
        const search_params = new URLSearchParams(window.location.search);
        
        var localStorageKey = 'uniqueId';
        var cookieKey = 'uniqueId';
        var uniqueId;
        var debug;
        const localeStr = navigator.language.replace('-', '_')

        // Coleta valores dos cookies
        const fbp = search_params.get('fbp') || getCookie('_fbp') || "";
        const fbc = search_params.get('fbc') || getCookie('_fbc') || "";
        const fbclid = search_params.get('fbclid') || getCookie('_fbclid') || "";
        const gaId = getCookie('_ga') || "";
        var old_id;
        
        const pattern = /^[a-z0-9]{9}_([0-9]+)$/;
        
        if (localStorage.getItem(localStorageKey)) {
            // Se nao esta na URL, mas esta no localStorage
            uniqueId = localStorage.getItem(localStorageKey);
            debug = 'send_email - sem url/ com local storage';
        } else if(getCookie(cookieKey)){
            // Se nao esta na URL, mas esta no localStorage
            uniqueId = getCookie(cookieKey);
            debug = 'send_email - sem url/ sem local storage/ mas no cookie';          
        }else if (utmTerm && (pattern.test(utmTerm)) && (document.referrer.includes(window.location.hostname))) {
            uniqueId = utmTerm;                 
            debug = 'send_email - com url/ sem local storage'            
        } else {
            // Se nao esta em nenhum dos dois, cria um novo
            uniqueId = Math.random().toString(36).substr(2, 9) + "_" + new Date().getTime();
            debug = 'send_email - sem url/ sem local storage';
        }


        const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
        const currentUrlParams = new URLSearchParams(window.location.search);
        const storedUtms = {};

        // Tenta recuperar UTM tags do localStorage e da URL
        utms.forEach(utm => {
            const valueFromUrl = getUTMParameter(utm, currentUrlParams);
            const valueFromStorage = localStorage.getItem(utm);

            if (valueFromUrl) {
                // Se UTM tag esta na URL, armazena no localStorage
                localStorage.setItem(utm, valueFromUrl);
                storedUtms[utm] = valueFromUrl;
            } else if (valueFromStorage) {
                // Se UTM tag nao esta na URL, mas esta no localStorage, marca para adicionar na URL
                storedUtms[utm] = valueFromStorage;
                shouldUpdateUrl = true;
            }
        });

        function getCartToken() {
            let cartValue = getCookie('cart');
            if (cartValue) {
                let parts = decodeURIComponent(cartValue).split('?');
                return parts[0]; // Retorna a parte antes do '?' ou a string inteira se nao houver '?'
            } else {
                return null; // Ou qualquer valor padrao adequado
            }
        }

        const url_params = new URLSearchParams(window.location.search);

        function getParameterValue(param) {
            const urlValue = getUTMParameter(param, url_params);
            if (urlValue) {
                return urlValue;
            }
            return localStorage.getItem(param) || '';
        }

        var eventData = {
            id: uniqueId,
            referrer: document.referrer,
            path: window.location.pathname,
            utm_source: getParameterValue('utm_source'),
            utm_medium: getParameterValue('utm_medium'),
            utm_campaign: getParameterValue('utm_campaign'),
            utm_term: uniqueId,
            utm_content: getParameterValue('utm_content'),
            sol_source: getParameterValue('sol_source'),
            sol_medium: getParameterValue('sol_medium'),
            sol_campaign: getParameterValue('sol_campaign'),
            sol_content: getParameterValue('sol_content'),
            fbp: fbp,
            fbc: fbc,
            ga_id: gaId,
            fbclid: fbclid,
            locale: localeStr.charAt(0).toUpperCase() + localeStr.slice(1),
            timezone: /.*\s(.+)/.exec((new Date()).toLocaleDateString(navigator.language, { timeZoneName:'short' }))[1],
            osVersion: navigator.appVersion.split(" ")[0],
            screenWidth: screen.width,
            screenHeight: screen.height,
            density: window.devicePixelRatio,
            cpuCores: navigator.hardwareConcurrency,
            queryParams: window.location.search,
            debug: debug,
            old_id: old_id,
            utmsTrack: getCookie('utmsTrack'),
            shopify_id: shopifyId,
            current_domain: currentDomain,
            email: email
        };

        function sendEventToServer() {
            eventData['cart_token'] = getCartToken();
            if (localStorage.getItem('sol_email_sent') === email) {
                console.log('Email ja enviado:', email);
                return;
            }
        
            // Envia uma requisicao POST para o endpoint /events
            fetch('https://pixel-events-se6wof3usq-ue.a.run.app/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
                keepalive: true
            })
            .then(response => response.json())
            .then(data => {
                console.log('Evento enviado com sucesso:', data);
                localStorage.setItem('sol_email_sent', email);
            }).catch((error) => {
                console.error('Erro ao enviar evento:', error);
            });
        }
        sendEventToServer();

        
    }
    async function getCookieSolomon(name) {
        if (window.shopify && window.shopify.browser) {
            return await window.shopify.browser.cookie.get(name);
        } else {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    }

    const cookieKeys = [
        'solomon_email', 'solomon_phone', 'solomon_firstName', 'solomon_lastName', 'solomon_city', 'solomon_state', 'solomon_zip', 'solomon_country'
    ];

    async function loadSolomonUser() {
        const cookieValues = {};

        // Iterar sobre cada chave de cookie possÃ­vel e buscar seu valor com getCookieSolomon
        for (const key of cookieKeys) {
            const value = await getCookieSolomon(key);
            if (value) {
                const realKey = key.substring('solomon_'.length);
                cookieValues[realKey] = decodeURIComponent(value);
            }
        }

        // Se encontrou algo nos cookies, retorna isso
        if (Object.keys(cookieValues).length > 0) {
            return cookieValues;
        }

        // Caso contrario, carrega do localStorage
        const storedUser = localStorage.getItem('SolomonUserInternal');
        if (storedUser) {
            return JSON.parse(storedUser);
        }

        return {};
    }

    loadSolomonUser().then(user => {
        SolomonUser = user;
        if (SolomonUser.email || (window.solomonCustomer && window.solomonCustomer.email)) {
            console.log('email sent:', SolomonUser.email ? SolomonUser.email : window.solomonCustomer.email);
            sendInternalEventWithEmail(window.solomonCustomer?.email ? window.solomonCustomer.email  : SolomonUser.email);
        }
    });

    function saveSolomonUser() {
        localStorage.setItem('SolomonUserInternal', JSON.stringify(SolomonUser));
        console.log('SolomonUser saved to localStorage:', SolomonUser);
    }



    document.addEventListener('DOMContentLoaded', () => {
        // Funcao para atualizar SolomonUser com base em inputs especÃ­ficos
        function updateSolomonUserFromInput(input) {
            console.log('adding event listener');
            input.addEventListener('change', () => {
                // Regex para ignorar maiusculas/minusculas
                const emailRegex = /email/i;
                const phoneRegex = /phone/i;
                const nameRegex = /name/i;
                const lastNameRegex = /last_name/i;
                const emailPattern = /^[^@\s]+@[^@\s]+\.[^\s]+$/;
                const phonePattern = /^(?:\D*\d){9}\D*$|^(?:\D*\d){11}\D*$|^(?:\D*\d){13}\D*$/;  


                // Verifica se inclui 'email' no id ou no name do input
                if (emailRegex.test(input.id) || emailRegex.test(input.name) || emailRegex.test(input.type)) {
                    const trimmedEmail = input.value.trim(); // Remove espacos ao redor
                    if (emailPattern.test(trimmedEmail)) {
                        SolomonUser.email = trimmedEmail;
                    }
                }
                // Verifica se inclui 'phone' no id ou no name do input
                else if (phoneRegex.test(input.id) || phoneRegex.test(input.name) || input.type === 'tel') {
                    const trimmedPhone = input.value.trim(); // Remove espacos ao redor
                    if (phonePattern.test(trimmedPhone)) {
                        SolomonUser.phone = trimmedPhone;
                    }
                }
                // Verifica se inclui 'name' no id ou no name do input
                else if (nameRegex.test(input.id) || nameRegex.test(input.name)) {
                    // Logica para separar nome e sobrenome
                    if (lastNameRegex.test(input.id) || lastNameRegex.test(input.name)) {
                        SolomonUser.lastName = input.value;
                    }else{
                        const names = input.value.split(' ');
                        if (names.length > 1) {
                            SolomonUser.firstName = names[0];
                            SolomonUser.lastName = names.slice(1).join(' ');
                        } else {
                            SolomonUser.firstName = names[0];
                            SolomonUser.lastName = SolomonUser.lastName || '';
                        }
                    }
                    
                }
                saveSolomonUser();
                if (SolomonUser.email) {
                    sendInternalEventWithEmail(SolomonUser.email);
                }
                console.log('SolomonUser updated:', SolomonUser);
                
            });
        }

        // Funcao para encontrar e vincular todos os inputs relevantes
        function bindInputs(root = document) {
            // Selecionar todos os inputs e textareas relevantes no escopo especificado
            const inputs = root.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if (/email/i.test(input.id) || /email/i.test(input.name) || /email/i.test(input.type) ||
                    /phone/i.test(input.id) || /phone/i.test(input.name) || input.type === 'tel' ||
                    /name/i.test(input.id) || /name/i.test(input.name)) {
                    updateSolomonUserFromInput(input);
                }
            });
        
            // Verificar se há shadowRoots e explorar seus conteúdos
            const shadowHosts = root.querySelectorAll('*');
            shadowHosts.forEach(host => {
                if (host.shadowRoot) {
                    bindInputs(host.shadowRoot); // Recursivamente vincular inputs dentro do shadowRoot
                }
            });
        }

        const SolObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            // Adicionar bindInputs nos novos elementos adicionados
                            bindInputs(node);
                        }
                    });
                }
            });
        });
        

        // Observar mudancas no DOM para lidar com inputs que sao carregados dinamicamente
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {               
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            // Verificar se o nó possui shadowRoot
                            if (node.shadowRoot) {
                                bindInputs(node.shadowRoot); // Bind inputs dentro do shadowRoot
                            }
                            // Bind inputs normais no nó adicionado
                            bindInputs(node);

                            // se o nó tiver um iframe chamado edrone-onsite-popup-iframe pega o iframe.contentDocument || iframe.contentWindow.document; se tiver, da bindInputs
                            const iframe = node.querySelector('#edrone-onsite-popup-iframe');
                            if (iframe) {
                                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                if (iframeDoc) {
                                    bindInputs(iframeDoc); // Aplica bindInputs no conteúdo do iframe
                                    // Observar mudanças dinâmicas no iframe
                                    SolObserver.observe(iframeDoc.body, {
                                        childList: true,
                                        subtree: true,
                                    });
                                }
                            }
                        }
                    });
                }
            });
        });

        // Configuracoes do observador para monitorar adicao de novos nos
        const observerOptions = {
            childList: true,
            subtree: true
        };

        // Iniciar a observacao do documento
        observer.observe(document.body, observerOptions);

        // Atualizar SolomonUser para inputs ja existentes na pagina
        bindInputs();
    });
})();  
  