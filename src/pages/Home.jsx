import TopNav from '../components/navigations/TopNav';
import StoriesBar from '../components/stories/StoriesBar';
import Feed from '../components/feed/Feed';
import BottomNav from '../components/navigations/BottomNav';

export default function Home({ navigate }) {
  return (
    <div className="app-page-with-nav konnet-home min-h-[100dvh] bg-white dark:bg-[#0B1020]">
      <TopNav navigate={navigate} />
      <StoriesBar navigate={navigate} />
      <main className="konnet-feed mx-auto w-full px-3 pb-4 pt-3">
        <Feed navigate={navigate} />
      </main>
      <BottomNav activePage="home" navigate={navigate} />
    </div>
  );
}
