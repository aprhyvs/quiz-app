


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
    const formData = new FormData();
    formData.append('text', textMessage);
    fetch('/api/generate/voice',
    {
        method: 'POST',
        headers: { 
            "X-CSRFToken": csrf_token,
        },
        body: formData,
    }
    )
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.blob(); // Get the file as a Blob
    })
    .then(blob => {
        // Create a URL for the Blob and play the audio
        const audioURL = URL.createObjectURL(blob);
        const audio = new Audio(audioURL);
        audio.play(); // Play the audio
    })
    .catch(error => {
        console.error('Error fetching the audio file:', error);
    });
}

// dark theme toggle
document.addEventListener('DOMContentLoaded', () => {
    let darkmode = localStorage.getItem('darkmode')
    const themeSwitch = document.getElementById('theme-switch')

    const enableDarkmode = () => {
        document.body.classList.add('darkmode')
        localStorage.setItem('darkmode', 'active');
        generateVoiceMessage("Hello guys this is message");
    }

    const disableDarkmode = () => {
        document.body.classList.remove('darkmode');
        localStorage.setItem('darkmode', null);
        generateVoiceMessage("Hello guys this is message");
    }

    if (darkmode === "active") enableDarkmode()

    themeSwitch.addEventListener("click", () => {
        darkmode = localStorage.getItem('darkmode')
        darkmode !== "active" ? enableDarkmode() : disableDarkmode()
    })

});

