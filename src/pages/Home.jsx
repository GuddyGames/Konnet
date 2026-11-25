import TopNav from '../components/navigations/TopNav';
import StoriesBar from '../components/stories/StoriesBar';
import Feed from '../components/feed/Feed';
import BottomNav from '../components/navigations/BottomNav';

export default function Home({ navigate }) {
  return (
    <div className="app-page-with-nav min-h-[100dvh] bg-[#F7F8FC] dark:bg-[#0B1020]">
      <TopNav navigate={navigate} />
      <StoriesBar navigate={navigate} />
      <main className="konnet-feed mx-auto w-full max-w-2xl px-3 pb-3 pt-3">
        <Feed navigate={navigate} />
      </main>
      <BottomNav activePage="home" navigate={navigate} />
    </div>
  );
}
