import { Skeleton } from "../ui/skeleton"

const UserCardSkeleton = () => {

    return (
        <div className={`w-full py-2 border-gray-600 flex gap-3 box-border px-4 items-center justify-center hover:backdrop-brightness-125 `}>
            <div className="pic ">
                <Skeleton className={"size-11 rounded-full"} />
            </div>
            <div className="flex flex-col w-full items-start gap-3 ">
                <div className='flex justify-start w-full items-center '>
                    <Skeleton className={"w-4/5 rounded-lg h-3"} />
                </div>
                <div className='flex justify-start w-full items-center'>
                    <Skeleton className={"w-4/5 rounded-lg h-3"} />
                </div>
            </div>
        </div>
    )
}

export default UserCardSkeleton
