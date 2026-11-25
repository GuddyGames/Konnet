import TopNav from '../components/navigations/TopNav';
import StoriesBar from '../components/stories/StoriesBar';
import Feed from '../components/feed/Feed';
import BottomNav from '../components/navigations/BottomNav';

export default function Home({ navigate }) {
  return (
    <div className="app-page-with-nav">
      <TopNav navigate={navigate} />
      <StoriesBar navigate={navigate} />
      <Feed navigate={navigate} />
      <BottomNav activePage="home" navigate={navigate} />
    </div>
  );
}
