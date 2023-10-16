export default function Page() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-full flex flex-col justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-medium border-r-2 border-gray-300 pr-6 mr-5 inline-block leading-[49px] align-top">
                        404
                    </h1>
                    <div className="inline-block">
                        <h2 className="text-sm font-normal leading-[49px] m-0">
                            This page could not be found.
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
