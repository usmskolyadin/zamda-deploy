class ReferralMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ref = request.GET.get("ref")

        if ref:
            request.session["ref_code"] = ref

        return self.get_response(request)