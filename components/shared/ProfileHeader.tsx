import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  accountId: string;
  authUserId: string;
  name: string;
  username: string;
  imgURL: string;
  bio: string;
  type?: 'User' | 'Community';
  isCreator?: boolean;
}

const ProfileHeader = ({
  accountId,
  authUserId,
  name,
  username,
  imgURL,
  bio,
  type = 'User',
  isCreator,
}: Props) => {
  const canEdit = (type === 'User' && accountId === authUserId) || (type === 'Community' && isCreator);

  return (
    <div className="flex flex-col w-full justify-start">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 object-cover">
            <Image
              src={imgURL}
              alt="Profile Image"
              fill
              className="rounded-full object-cover shadow-2xl"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-left text-heading3-bold text-light-1">
              {name}
            </h2>
            <p className="text-base-medium text-gray-1">@{username}</p>
          </div>
        </div>
        
        {canEdit && (
          <Link href={type === 'Community' ? `/communities/edit/${accountId}` : "/profile/edit"} className="flex-shrink-0">
            <div className="flex cursor-pointer gap-2 rounded-lg bg-dark-3 px-4 py-2 hover:bg-zinc-800 transition-colors">
              <Image 
                src="/assets/edit.svg"
                alt="edit"
                width={18}
                height={18}
              />
              <p className="text-light-2 text-small-medium">Edit</p>
            </div>
          </Link>
        )}
      </div>

      <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>
      <div className="mt-12 h-0.5 w-full bg-dark-3" />
    </div>
  );
};

export default ProfileHeader;
