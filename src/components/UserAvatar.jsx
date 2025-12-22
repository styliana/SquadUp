const UserAvatar = ({ avatarUrl, name, className = "w-10 h-10", textSize = "text-sm" }) => {
  // Jeśli jest URL zdjęcia -> wyświetl zdjęcie
  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={name || "User"} 
        className={`${className} rounded-full object-cover border border-border shrink-0`}
      />
    );
  }

  // Jeśli nie ma zdjęcia -> wyświetl kolorowe kółko z inicjałem
  return (
    <div className={`${className} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-textMain font-bold ${textSize} border border-border shrink-0 uppercase`}>
      {name ? name.charAt(0) : '?'}
    </div>
  );
};

export default UserAvatar;