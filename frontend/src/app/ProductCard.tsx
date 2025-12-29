import Link from "next/link";
import { Advertisement } from "../entities/advertisment/model/types";
import { useViewAd } from "../features/hooks/use-view-ad";
import { useAuth } from "../features/context/auth-context";
import { useLikeAd } from "../features/hooks/use-like-ad";
import Image from "next/image";

type ProductCardProps = {
  ad?: Advertisement;
  loading?: boolean;
};

export default function ProductCard({ ad, loading }: ProductCardProps) {
  const { accessToken } = useAuth();
  const { isLiked, likesCount, toggleLike, loading: likeLoading } = useLikeAd(ad?.slug, accessToken);
  const { viewsCount } = useViewAd(ad?.slug);

  if (loading || !ad) {
    return (
      <div className="bg-white rounded-2xl w-full animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-2xl mb-2"></div>
        <div className="p-4 space-y-2">
          <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
          <div className="mt-4 flex justify-between items-center">
            <div className="h-6 mr-2 w-16 bg-gray-300 rounded"></div>
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/${ad.category_slug}/${ad.subcategory}/${ad.slug}`}>
      <div className="bg-white rounded-2xl w-full hover:opacity-70 transition">
        <div className="relative">
          <Image
            src={ad.images[0]?.image}
            alt={ad.title}
            width={200}
            height={400}
            className="w-full max-h-[200px] min-h-[200px] object-cover rounded-2xl mb-2"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleLike();
            }}
            className="absolute top-2 right-2 cursor-pointer rounded-full"
          >
            {isLiked ? (
                <div className="absolute top-0 right-0 fdfdsdf bg-black/30 p-2 rounded-full">
                  <svg width="24" height="24" className="" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                        fill="#ffffff"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                  </svg>
                </div>
            ) : (
                <div className="absolute top-0 right-0  bg-black/30 p-2 rounded-full">
                  <svg width="24" height="24" className="invert" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
            )}
          </button>
        </div>

        <div className="p-4 flex-col items-center justify-center">
          <h3 className="font-semibold text-xl text-left mb-2 ml-2 text-[#2AAEF7] break-words overflow-hidden truncate">
            {ad.title}
          </h3>
          <div className="pl-2 pr-2">
            <p
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
              className="text-gray-800 line-clamp-3 break-words overflow-hidden leading-snug"
            >
              {ad.description}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between p-2 space-x-2 mb-1 w-full">
            <div className="w-full">
              <p className="pb-1 w-full flex items-center text-sm font-medium text-black/80 truncate overflow-hidden text-ellipsis max-w-[180px] sm:max-w-[220px] md:max-w-[260px]">
                <svg className="mr-1" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.03125 8.91703L19.5079 4.58356C19.8834 4.47843 20.2293 4.8244 20.1242 5.19986L15.7907 20.6765C15.6641 21.1286 15.0406 21.1728 14.8516 20.7431L11.6033 13.3607C11.553 13.2462 11.4615 13.1548 11.347 13.1044L3.9647 9.85617C3.535 9.66711 3.57919 9.04361 4.03125 8.91703Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                {ad.location}
              </p>     
              <div className="flex justify-between w-full">
                <span className="text-black font-semibold text-xl flex items-center">${ad.price}</span>
                <div className="flex items-center">
                                  <span className="text-sm text-black/80 font-medium mr-1 flex items-center">
                    <svg className="mr-1" width="18" height="18" viewBox="0 -4 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="Dribbble-Light-Preview" transform="translate(-260.000000, -4563.000000)" fill="#000000">
                                <g id="icons" transform="translate(56.000000, 160.000000)">
                                    <path d="M216,4409.00052 C216,4410.14768 215.105,4411.07682 214,4411.07682 C212.895,4411.07682 212,4410.14768 212,4409.00052 C212,4407.85336 212.895,4406.92421 214,4406.92421 C215.105,4406.92421 216,4407.85336 216,4409.00052 M214,4412.9237 C211.011,4412.9237 208.195,4411.44744 206.399,4409.00052 C208.195,4406.55359 211.011,4405.0763 214,4405.0763 C216.989,4405.0763 219.805,4406.55359 221.601,4409.00052 C219.805,4411.44744 216.989,4412.9237 214,4412.9237 M214,4403 C209.724,4403 205.999,4405.41682 204,4409.00052 C205.999,4412.58422 209.724,4415 214,4415 C218.276,4415 222.001,4412.58422 224,4409.00052 C222.001,4405.41682 218.276,4403 214,4403" id="view_simple-[#815]">

                              </path>
                                </g>
                            </g>
                        </g>
                    </svg>
                    {viewsCount ?? ad.views_count}
                  </span> 
                  <span className="mr-1">•</span>  
                  <span className="text-sm text-black/80 font-medium flex items-center">
                                  <svg
                        width="18"
                        height="18"
                        className="mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>{likesCount ?? ad.likes_count}
                  </span>  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
