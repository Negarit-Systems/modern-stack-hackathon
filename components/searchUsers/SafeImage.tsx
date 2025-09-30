import { useState } from "react";
import { Collaborator } from "./SearchUsers";

const SafeImage = ({ collaborator }: { collaborator: Collaborator }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !collaborator.image) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm">
        {collaborator.name?.[0]?.toUpperCase() ||
          collaborator.email[0]?.toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={collaborator.image}
      alt={collaborator.name || collaborator.email}
      className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
      onError={() => setImgError(true)}
    />
  );
};

export default SafeImage;
