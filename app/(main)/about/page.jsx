import Banner from "../../components/Banner";
import CollectionGrid from "../../components/CollectionGrid";
import Escape from "../../components/Escape";
import ExceptionalService from "../../components/ExceptionalService";
import MeetOurTeam from "../../components/MeetOurTeam";
import WhyHalaYachts from "../../components/WhyHalaYachts";

export default function About() {
  return (
    <>
      <Banner
        mainHeading="About Us"
        showContact={true}
        height="medium"
        backgroundImage="/images/about_us.png"
      />
      <Escape />
      <CollectionGrid />
      <MeetOurTeam />
      <ExceptionalService />
      <WhyHalaYachts />
    </>
  );
}