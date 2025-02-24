import VideoPlayer from "../components/Plyr/Video";
import AudioPlayer from "../components/Plyr/Audio";

export default function Message({ msg, session }) {
  const formatContent = (msg) => {
    const words = msg.content.split(' ');

    return words.map((word, index) => {
      if (msg.tags.includes(word)) {
        return (
          <b
            key={index}
            className="px-1 py-0.5 underline rounded-md m-1 text-white transition-colors cursor-pointer"
            onClick={() => window.location.href = `/User?id=${msg.userID}`}
            title="Click to see his profile !"
          >
            <span className="text-[red]">@</span>{word}
          </b>
        );
      }
      return <span key={index}>{word} </span>;
    });
  };

  return (
    <div className={`flex flex-col ${msg.userID === session.id ? 'items-end' : 'items-start'} mb-4`}>
      <div className={`flex gap-4 ${msg.userID === session.id ? 'flex-row-reverse' : 'flex-row'} items-center`}>
        <img 
          src={msg.userID.img || "/user.png"} 
          width={40} 
          className="rounded-full border border-gray-300" 
        />
        <div className="flex flex-col">
          <span className="text-md font-bold text-gray-400">{msg.username}</span>
          <span className="text-xs text-gray-500">
            {new Date(msg.date).toLocaleString()}
          </span>
        </div>
      </div>

      <div
        className={`max-w-4xl px-4 py-1 rounded-tl-2xl rounded-br-2xl shadow-2xl transition-all duration-200 ease-out transform ${
          msg.type !== 'text' ? '' :
          msg.username === session.username
            ? 'bg-gradient-to-br from-purple-500 to-blue-500'
            : 'bg-gradient-to-br from-gray-800 to-gray-700'
        } hover:rotate-2 cursor-pointer relative text-white mt-1`}
      >
        <div>
          {msg.type === 'text' && (
            <p className="text-lg leading-relaxed break-words">
              {formatContent(msg)}
            </p>
          )}
          {msg.type === 'image' && (
            <img
              src={msg.content}
              alt="Contenu image du message"
              className="mt-4 max-w-[400px] max-h-[400px] object-cover rounded-lg shadow-sm"
            />
          )}
          {msg.type === 'video' && (
            <video
              src={msg.content}
              controls
              className="mt-4 max-w-full max-h-[300px] rounded-lg shadow-sm"
            />
          )}
          {msg.type === 'audio' && (
            <audio
              src={msg.content}
              controls
              className="mt-4 w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
