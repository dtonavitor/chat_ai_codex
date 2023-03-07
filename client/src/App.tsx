import bot from "../assets/bot.svg"
import user from "../assets/user.svg"
import './index.css'
import React, { useState  } from "react"

interface ChatMessage {
  id: string;
  value: string;
  isAi: boolean;
}

const generateUniqueId = (): string => {
  const timpestamp = Date.now()
  const randomNumber = Math.random()
  const hexString = randomNumber.toString(16)

  return `id-${timpestamp}-${hexString}`
}

function ChatStripe({isAi, value, id}: ChatMessage) {
  return (
    <div className={`wrapper ${isAi ? 'ai bot-chat' : "user-chat"}`}>
        <div className="chat">
            <div className="profile">
                <img 
                  src={isAi ? bot : user} 
                  alt={isAi ? 'bot' : 'user'} 
                />
            </div>
            <div className="message" id={id}>{value}</div>
        </div>
    </div>
  )
}

function App() {

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const data = new FormData(e.currentTarget)

    const value = data.get("prompt") as string

    setChatMessages([
      ...chatMessages, 
      {id: generateUniqueId(), value, isAi: false},
    ])

    e.currentTarget.reset()

    setIsLoading(true);

    try {
        const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
        },
        body: JSON.stringify({prompt: value}),
      })

      if (response.ok) {
        const data = await response.json()
        const parsedData = data.bot.trim()
        const botMessage: ChatMessage = {
          id: generateUniqueId(),
          value: parsedData,
          isAi: true,
        }

        setChatMessages([...chatMessages, {id: generateUniqueId(), value, isAi: false},
          botMessage])
      }
      else {
        const err = await response.text()
        alert(err)
      }
    }
    catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setIsLoading(false)
  }

  return (
    <div className="App">
      <div id="chat_container">
        {chatMessages.map(({id, value, isAi}) => (
          <ChatStripe key={id}  id={id} value={value} isAi={isAi} />
        ))}

        {isLoading && (
          <div className="wrapper ai">
            <div className="chat">
              <div className="profile">
                <img src={bot} alt="bot" />
              </div>
              <div className="message">...</div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea 
        name="prompt" 
        rows={1} 
        cols={1}
        placeholder='Ask Codex...' />
        <button type="submit">
          <img src="../assets/send.svg" />
        </button>
      </form>
    </div>
  )
}

export default App
