import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { PixabayAPI } from './api';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const searchFormEl = document.querySelector('form.search-form');
const galleryListEl = document.querySelector('div.gallery');
const loadMoreBtnEl = document.querySelector('button.load-more');

searchFormEl.addEventListener('submit', handlesearchFormElSubmit);
loadMoreBtnEl.addEventListener('click', handleLoadMoreBtnClick);

const pixabayAPI = new PixabayAPI();

const lightbox = new SimpleLightbox('.gallery a');

loadMoreBtnEl.classList.add("hidden");


function createGalleryCards(arr) {
  return  arr
.map(
  ({
    largeImageURL,
    webformatURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  }) => 
 `<div class="photo-card">  
<a class="cards-set-item link" href="${largeImageURL}">
  <img class="photo-card__img" src="${webformatURL}" alt="${tags}" loading="lazy" />    
  </a>
  <div class="info">
        <p class="info-item">
            <b>Likes</b>
            ${likes}
        </p>
        <p class="info-item">
            <b>Views</b>
            ${views}
        </p>
        <p class="info-item">
            <b>Comments</b>
            ${comments}
        </p>
        <p class="info-item">
            <b>Downloads</b>
            ${downloads}
        </p>
    </div>
</div>
`

)
.join('');
}


function handlesearchFormElSubmit(event) {
    event.preventDefault();
    clearInterface();
    loadMoreBtnEl.classList.add("hidden");

    const searchQuery = event.currentTarget.elements['searchQuery'].value.trim();

    pixabayAPI.q = searchQuery;
    pixabayAPI.page = 1;

    if (!searchQuery) {
        Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        return;
    }

    fetchPhotos();
}

async function fetchPhotos() {
    try {
        const { data } = await pixabayAPI.fetchPhotos();

        if (data.totalHits === 0) {
            Notify.failure("Sorry, there are no images matching your search query. Please try again.");
            return;
        }

        galleryListEl.innerHTML = createGalleryCards(data.hits);

        lightbox.refresh();

        Notify.success(`Hooray! We found ${data.totalHits} images.`); 
        if (data.totalHits > pixabayAPI.per_page) {
            loadMoreBtnEl.classList.remove("hidden");
        }

    } catch (error) {
        console.log(error);
    }  
}

async function fetchMorePhotos() {
    try {
        const { data } = await pixabayAPI.fetchPhotos();

        galleryListEl.insertAdjacentHTML('beforeend', createGalleryCards(data.hits));
        lightbox.refresh();  

        const { height: cardHeight } = galleryListEl.firstElementChild.getBoundingClientRect();

        window.scrollBy({
            top: cardHeight * 2,
            behavior: "smooth",
        });
        
        if (pixabayAPI.page >= data.totalHits / pixabayAPI.per_page) {
            loadMoreBtnEl.classList.add("hidden");
            Notify.failure("We're sorry, but you've reached the end of search results.");
        }

    } catch (error) {
        console.log(error);
    }
}

function handleLoadMoreBtnClick() {
    pixabayAPI.page += 1;

    fetchMorePhotos();   
}

function clearInterface() {
    galleryListEl.innerHTML = "";
}
