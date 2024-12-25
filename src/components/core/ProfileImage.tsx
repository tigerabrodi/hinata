import { User } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

type ProfileImageProps = ComponentProps<'img'> & {
  profileImage: User['profile_image']
}

export function ProfileImage({
  profileImage,
  className,
  ...props
}: ProfileImageProps) {
  return (
    <img
      className={cn('rounded-full', className)}
      srcSet={`
          ${profileImage.small} 32w,
          ${profileImage.medium} 64w, 
          ${profileImage.large} 128w
        `}
      src={profileImage.small}
      loading="lazy"
      {...props}
    />
  )
}
