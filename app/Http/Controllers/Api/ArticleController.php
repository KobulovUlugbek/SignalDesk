<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Article::query()->with('author:id,name')->latest('updated_at');
        if ($request->filled('q')) {
            $q = substr((string) $request->input('q'), 0, 100);
            $query->where(fn ($builder) => $builder->where('title', 'like', '%'.$q.'%')->orWhere('body', 'like', '%'.$q.'%'));
        }
        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $data = $this->validated($request);
        $article = Article::create([...$data, 'author_id' => $request->user()->id]);
        $logger->record('created', 'Wissensartikel erstellt: '.$article->title, 'article', $article->id);
        return response()->json(['data' => $article->load('author')], 201);
    }

    public function update(Request $request, Article $article, ActivityLogger $logger): JsonResponse
    {
        $article->update($this->validated($request, true));
        $logger->record('updated', 'Wissensartikel geändert: '.$article->title, 'article', $article->id);
        return response()->json(['data' => $article->load('author')]);
    }

    public function destroy(Article $article, ActivityLogger $logger): JsonResponse
    {
        $logger->record('deleted', 'Wissensartikel gelöscht: '.$article->title, 'article', $article->id);
        $article->delete();
        return response()->json(['ok' => true]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'title' => [$required, 'string', 'min:5', 'max:180'],
            'category' => [$required, 'string', 'max:60'],
            'body' => [$required, 'string', 'min:20', 'max:20000'],
            'published' => ['sometimes', 'boolean'],
        ]);
    }
}
