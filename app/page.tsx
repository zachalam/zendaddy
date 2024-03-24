import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";
import { DEFAULT_DEBUGGER_HUB_URL, createDebugUrl } from "./debug";
import { currentURL, getRandomSubarray } from "./utils";

type State = {
  active: string;
  total_button_presses: number;
  feelings_felt: any;
};

const GLOBAL_FEELINGS = ["Calm", "Centered", "Content", "Fulfilled", "Patient", "Peaceful", "Present", "Relaxed", "Serene", "Trusting"];
const tones = ["dumbledore", "spongebob", "thor", "zoltar"];
const initialState = {
  active: "1",
  total_button_presses: 0,
  feelings: [],
  pageIndex: 0
};

const reducer: FrameReducer<State> = (state, action) => {
  return {
    total_button_presses: state.total_button_presses + 1,
    active: action.postBody?.untrustedData.buttonIndex
      ? String(action.postBody?.untrustedData.buttonIndex)
      : "1",
    feelings: state.total_button_presses < 4 ? [...state.feelings, state.word] : state.feelings,
  };
};



// This is a react server component only
export default async function Home({ searchParams }: NextServerPageProps) {
  const url = currentURL("/");
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    hubHttpUrl: DEFAULT_DEBUGGER_HUB_URL,
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  const wrapFrame = (image, buttons) => {
    return (
      <div className="p-4">
        frames.js starter kit. The Template Frame is on this page, it&apos;s in
        the html meta tags (inspect source).{" "}
        <Link href={createDebugUrl(url)} className="underline">
          Debug
        </Link>{" "}
        or see{" "}
        <Link href="/examples" className="underline">
          other examples
        </Link>
        <FrameContainer
          postUrl="/frames"
          pathname="/"
          state={state}
          previousFrame={previousFrame}
        >
          {/* <FrameImage src="https://framesjs.org/og.png" /> */}
          <FrameImage aspectRatio="1.91:1">
            <div tw="flex flex-col w-full h-full bg-lime-700 text-white justify-center items-center">
              {image}
            </div>
          </FrameImage>
          {buttons}
        </FrameContainer>
      </div>
    )

  }

  // Here: do a server side side effect either sync or async (using await), such as minting an NFT if you want.
  // example: load the users credentials & check they have an NFT

  console.log("info: state is:", state);

  if (state.total_button_presses < 4) {
    // ask emotions
    return wrapFrame(

      <div tw="flex-none pl-32 pr-32 text-8xl">
        {"🤔 Which word best describes how you're feeling?"}
      </div>

      ,
      getRandomSubarray(GLOBAL_FEELINGS, 4).map((word) => (
        <FrameButton>
          {word}
        </FrameButton>
      ))
    );


  } else {
    if (state.total_button_presses == 4) {
      // ask for tone

      return wrapFrame(
        <div tw="pl-32 pr-32 flex flex-row text-8xl">
          {"🧙 Who would you like to get a response from?"}
        </div>,
        getRandomSubarray(tones, 4).map((word) => (
          <FrameButton>
            {word}
          </FrameButton>
        ))
      );

    } else {
      // show results.

      return wrapFrame(
        <div tw="flex flex-row">
          {"'Here's where we can put the response for the call to the LLM..'"}
        </div>,
        <FrameButton>
            share
        </FrameButton>
      );

    }
  }
}
