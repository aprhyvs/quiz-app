


async function getDataFromUrl(url){
    try{
        const response = await fetch(url, { 
            headers: {
                "X-CSRFToken": csrf_token,
            },
        }

        );
        if(!response.ok){
            return null;
        }
        const data = await response.json();
        return data;
        
    } catch(error){
        console.error('Error fetching data:', error);
    }
    return null;
}

async function getDataFromUrlWithParams(url, params){ 
    try{
        let formData = new FormData();
        for (const [key, value] of Object.entries(params)) {
            formData.append(key, value);
        }
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
                "X-CSRFToken": csrf_token,
            },
            body: formData, 
        }

        );
        if(!response.ok){
            return null;
        }
        const data = await response.json();
        return data;
    } catch(error){
        console.error('Error fetching data:', error);
    }
    return null;
}

async function generateVoiceMessage(textMessage){
    try{
        let formData = new FormData();
        for (const [key, value] of Object.entries(params)) {
            formData.append(key, value);
        }
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
                "X-CSRFToken": csrf_token,
            },
            body: formData, 
        }

        );
        if(!response.ok){
            return null;
        }
        const data = await response.json();
        return data;
    } catch(error){
        console.error('Error fetching data:', error);
    }
    return null;
}

// dark theme toggle

let darkmode = localStorage.getItem('darkmode')
const themeSwitch = document.getElementById('theme-switch')

const enableDarkmode = () => {
    document.body.classList.add('darkmode')
    localStorage.setItem('darkmode', 'active')
}

const disableDarkmode = () => {
    document.body.classList.remove('darkmode')
    localStorage.setItem('darkmode', null)
}

if (darkmode === "active") enableDarkmode()

themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem('darkmode')
    darkmode !== "active" ? enableDarkmode() : disableDarkmode()
})
