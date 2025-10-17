import React from 'react'
import UserCardSkeleton from './userCardSkeleton';

const UsersSkeleton = () => {
  return (
    <>
     {
        [1,2,3,4,5,6].map(i=>{
            return <UserCardSkeleton/>
        })
     } 
    </>
  )
}

export default UsersSkeleton;
