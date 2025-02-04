import { convertXmlToText } from "@/helpers/convert-from-xml";
import { addSpaceAfterPeriods, removeZeros } from "@/helpers/utils";
import { AuthorData } from "@/helpers/types";
import * as fs from "fs";
import Image from "next/image";
import DiscussionHistory from "./components/historythread";
import Link from "next/link";
import BreadCrumbs from "./components/BreadCrumb";
import { MarkdownWrapper } from "@/app/components/server/MarkdownWrapper";

export type sortedAuthorData = AuthorData & {initialIndex: number, dateInMS: number}

const getSummaryData = async (path: string[]) => {
  const pathString = path.join("/")
  try {
    const fileContent = fs.readFileSync(
      `${process.cwd()}/public/static/static/${pathString}.xml`,
      "utf-8"
    );
    const data = await convertXmlToText(fileContent, pathString);
    const linksCopy = data.data?.historyLinks
    
    const authorsFormatted: sortedAuthorData[] = data.data.authors.map((author, index) => ({...author, name: removeZeros(author), initialIndex: index, dateInMS: Date.parse(author.date + "T" + author.time)}))
    
    const chronologicalAuthors = authorsFormatted.sort((a, b) => {
      if (a.dateInMS < b.dateInMS) {
        return -1
      }
      if (a.dateInMS > b.dateInMS) {
        return 1
      }
      else {
        return 0
      }
    })
    const chronologicalLinksBasedOffAuthors = linksCopy?.length ? chronologicalAuthors.map((author) => linksCopy[author.initialIndex]) : []
    
    return {
      ...data,
      "data": {
        ...data.data,
        authors: chronologicalAuthors,
        historyLinks: chronologicalLinksBasedOffAuthors
      }
    };
  } catch (err) {
    return null
  }
};

export default async function Page({ params, searchParams }: { params: { path: string[] }, searchParams: { replies: string } }) {
  const summaryData = await getSummaryData(params.path);
  if (!summaryData) return <h1>No data found</h1>;
  const splitSentences = summaryData.data.entry.summary.split(/(?<=[.!?])\s+/);
  const firstSentence = splitSentences[0];
  const newSummary = summaryData.data.entry.summary.replace(firstSentence, "");
  const { authors, historyLinks, entry } = summaryData.data;
  const { link } = entry;
  
  return (
    <main>
      <div className='flex flex-col gap-4 my-10'>
        <BreadCrumbs params={params} summaryData={summaryData} replies={searchParams.replies} />
        <h2 className='font-inika text-4xl'>{summaryData.data.title}</h2>
        <div className='flex items-center gap-2'>
          {historyLinks && historyLinks?.length == 0 && link ? (
            <Link href={link} target="_blank">
              <span className="pb-[2px] border-b-2 border-brand-secondary leading-relaxed text-brand-secondary font-semibold">
                Original Post
              </span>
            </Link>
          ) : null}
          {authors.length === 1 ? (
            <span className="text-gray-600 font-semibold">by {authors[0].name}</span>
          ) : null}
        </div>
      </div>
      <section className='my-10'>
        <MarkdownWrapper summary={firstSentence} className='text-2xl font-inika my-2' />
        <MarkdownWrapper summary={newSummary} className='whitespace-pre-line summaryTags' />
      </section>
      {historyLinks && historyLinks?.length > 0 ? (
        <DiscussionHistory historyLinks={historyLinks} authors={authors} replies={searchParams.replies} />
      ) : null}
    </main>
  );
}
