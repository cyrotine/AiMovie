export default function MessageBubble({ from = 'ai', children }) {
  return (
    <div className={from === 'user' ? 'text-right' : 'text-left'}>
      <div className={from === 'user' ? 'inline-block bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] text-black px-4 py-2 rounded-lg' : 'inline-block bg-gray-800 px-4 py-2 rounded-lg'}>
        {children}
      </div>
    </div>
  )
}
