import { createContext, useState, useEffect } from "react";
import run from "../services/generativeAI";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [previousPrompt, setPreviousPrompt] = useState([]);
    const [resultData, setResultData] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [finalResponse, setFinalResponse] = useState("");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [displayImage, setDisplayImage] = useState(null)
    const [darkMode, setDarkMode] = useState(false);

    // Recent and Cards  
    const loadPrompt = async (prompt) => {
        setRecentPrompt(prompt)
        await onSent(prompt)
    }

    // Dark Mode
    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    // Function to clear all recent prompts
    const clearRecentPrompts = () => {
        setPreviousPrompt([]); // Clear the previousPrompt array
    };

    // Voice input feature
    useEffect(() => {
        if (isListening) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-IN';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                onSent(transcript);
            };

            recognition.onerror = (event) => {
                console.error(event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        }
    }, [isListening]);

    const toggleListening = () => {
        setIsListening(prev => !prev);
    };

    // Typing Effect
    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData(prev => prev + nextWord)
        }, 75 * index);
    };

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
    };

    const onSent = async (prompt) => {
        setResultData("");
        setLoading(true);
        setShowResult(true);

        let searchQuery = prompt !== undefined ? prompt : input;



        if (searchQuery.trim() !== "") {
            // Update the recent prompt immediately
            setRecentPrompt(searchQuery);
            setPreviousPrompt(prev => [...prev, searchQuery]);
        } else {
            setRecentPrompt("")
        }

        const response = await run(searchQuery, uploadedImage);

        // Text Formatting Start
        // Handle bold (**)
        let responseArray = response.split("**");
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i % 2 !== 1) {
                newResponse += responseArray[i];
            } else {
                newResponse += "<b>" + responseArray[i] + "</b>";
            }
        }

        // Handle (*) and line breaks
        let newResponse2 = newResponse.split("*").join("<br>");

        // Handle headings (##)
        let responseArray3 = newResponse2.split("## ");
        let formattedResponse = "";

        // Process ## into <h2> including the ':'
        for (let i = 0; i < responseArray3.length; i++) {
            if (i === 0) {
                formattedResponse += responseArray3[i];
            } else {
                let splitByColon = responseArray3[i].split(":");
                formattedResponse += "<h2>" + splitByColon[0] + ":</h2>";

                // Add the rest of the text after the heading
                if (splitByColon.length > 1) {
                    formattedResponse += splitByColon.slice(1).join(":");
                }
            }

            // Detect URLs and wrap them in <a> tags
            const urlRegex = /(https?:\/\/www\.[^\s]+|www\.[^\s]+)/g;
            formattedResponse = formattedResponse.replace(urlRegex, (url) => {
                console.log(url)
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            });

        }
        // Text Formatting End

        // Text effect
        let newResponseArray = formattedResponse.split(" ");
        for (let i = 0; i < newResponseArray.length; i++) {
            const nextWord = newResponseArray[i];
            delayPara(i, nextWord + " ");
        }

        setFinalResponse(formattedResponse);
        setLoading(false);
        setInput("");
        setDisplayImage(null)
        setUploadedImage(null)
    };

    const contextValue = {
        input,
        setInput,
        previousPrompt,
        setPreviousPrompt,
        onSent,
        recentPrompt,
        setRecentPrompt,
        showResult,
        resultData,
        loading,
        newChat,
        isListening,
        toggleListening,
        finalResponse,
        uploadedImage,
        setUploadedImage,
        displayImage,
        setDisplayImage,
        darkMode,
        toggleDarkMode,
        clearRecentPrompts,
        loadPrompt,
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
