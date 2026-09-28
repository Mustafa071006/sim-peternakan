import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster position="top-right" gutter={10} containerStyle={{ top: 20 }} />
  );
}
